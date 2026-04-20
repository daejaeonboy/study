"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

import {
  disciplineBranches,
  findBranchByDiscipline,
  getDisciplineProfile,
} from "@/lib/disciplines";
import type { GraphSelection } from "@/lib/graph-documents";

const GRAPH_WIDTH = 4000;
const GRAPH_HEIGHT = 2600;
const MIN_SCALE = 0.28;
const MAX_SCALE = 3.4;
const ZOOM_SENSITIVITY = 0.0014;
const ZOOM_STEP = 1.18;
const ROOT_NODE = {
  label: "학문",
  x: GRAPH_WIDTH / 2,
  y: GRAPH_HEIGHT / 2,
};

type KnowledgeGraphCanvasProps = {
  selectedDiscipline: string;
  selectedStage: string | null;
  selectedTopic: string | null;
  isCurriculumExpanded: boolean;
  onSelectNode: (selection: GraphSelection) => void;
  onReadNode: (selection: GraphSelection) => void;
};

type DisciplineNode = {
  label: string;
  x: number;
  y: number;
  active: boolean;
  muted: boolean;
};

type BranchNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  active: boolean;
};

type MathStageNode = {
  level: string;
  title: string;
  x: number;
  y: number;
  active: boolean;
};

type MathTopicNode = {
  level: string;
  label: string;
  x: number;
  y: number;
  active: boolean;
  muted: boolean;
};

type GraphLink = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  tone: "primary" | "secondary" | "ghost";
};

type GraphModel = ReturnType<typeof buildGraph>;

function hashValue(input: string) {
  let hash = 0;

  for (const character of input) {
    hash = (hash << 5) - hash + character.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash);
}

function buildDisciplinePoint(
  branch: (typeof disciplineBranches)[number],
  discipline: string,
  index: number,
) {
  const count = branch.disciplines.length;
  const angle = -112 + (224 / Math.max(count - 1, 1)) * index + (hashValue(discipline) % 12) - 6;
  const radians = (angle * Math.PI) / 180;

  return {
    x: branch.x + Math.cos(radians) * branch.radiusX,
    y: branch.y + Math.sin(radians) * branch.radiusY,
  };
}

function resolveCurriculumStage(
  discipline: string,
  selectedStage: string | null,
  selectedTopic: string | null,
) {
  const stages = getDisciplineProfile(discipline).stages ?? [];

  if (!stages.length) {
    return null;
  }

  if (selectedStage) {
    return stages.find((stage) => stage.level === selectedStage) ?? stages[0];
  }

  if (selectedTopic) {
    return stages.find((stage) => stage.topics.includes(selectedTopic)) ?? stages[0];
  }

  return null;
}

function buildMathCurriculum(
  mathNode: DisciplineNode,
  discipline: string,
  activeStageLevel: string | null,
  selectedTopic: string | null,
) {
  const stages = getDisciplineProfile(discipline).stages ?? [];
  const stageStartX = mathNode.x + 250;
  const stageStartY = mathNode.y - 330;
  const stageGapY = 215;
  const topicOffsetX = 250;
  const topicGapY = 38;

  const stageNodes: MathStageNode[] = stages.map((stage, index) => ({
    level: stage.level,
    title: stage.title,
    x: stageStartX + (index % 2) * 36,
    y: stageStartY + index * stageGapY,
    active: activeStageLevel === stage.level,
  }));

  const visibleStages = activeStageLevel ? stages.filter((stage) => stage.level === activeStageLevel) : [];
  const topicNodes: MathTopicNode[] = visibleStages.flatMap((stage) => {
    const stageNode = stageNodes.find((node) => node.level === stage.level)!;
    const stackStartY = stageNode.y - ((stage.topics.length - 1) * topicGapY) / 2;

    return stage.topics.map((topic, topicIndex) => ({
      level: stage.level,
      label: topic,
      x: stageNode.x + topicOffsetX,
      y: stackStartY + topicIndex * topicGapY,
      active: selectedTopic === topic,
      muted: false,
    }));
  });

  const links: GraphLink[] = [
    ...stageNodes.map((stage) => {
      const tone: GraphLink["tone"] = stage.active ? "primary" : "secondary";

      return {
        id: `math:${stage.level}`,
        from: { x: mathNode.x, y: mathNode.y },
        to: { x: stage.x, y: stage.y },
        tone,
      };
    }),
    ...topicNodes.map((topic) => {
      const tone: GraphLink["tone"] = topic.active
        ? "primary"
        : activeStageLevel
          ? topic.level === activeStageLevel
            ? "secondary"
            : "ghost"
          : "secondary";

      const stageNode = stageNodes.find((stage) => stage.level === topic.level)!;

      return {
        id: `topic:${topic.level}:${topic.label}`,
        from: { x: stageNode.x, y: stageNode.y },
        to: { x: topic.x, y: topic.y },
        tone,
      };
    }),
  ];

  return {
    stageNodes,
    topicNodes,
    links,
  };
}

function buildGraph(
  selectedDiscipline: string,
  selectedStage: string | null,
  selectedTopic: string | null,
  isCurriculumExpanded: boolean,
) {
  const selectedBranch = findBranchByDiscipline(selectedDiscipline);
  const branchNodes: BranchNode[] = disciplineBranches.map((branch) => ({
    id: branch.id,
    label: branch.label,
    x: branch.x,
    y: branch.y,
    active: branch.id === selectedBranch?.id,
  }));

  const disciplineNodes: DisciplineNode[] = disciplineBranches.flatMap((branch) =>
    branch.disciplines.map((discipline, index) => {
      const point = buildDisciplinePoint(branch, discipline, index);

      return {
        label: discipline,
        x: point.x,
        y: point.y,
        active: discipline === selectedDiscipline,
        muted: selectedBranch ? branch.id !== selectedBranch.id : false,
      };
    }),
  );

  const links: GraphLink[] = [
    ...branchNodes.map((branch) => {
      const tone: GraphLink["tone"] = branch.active ? "primary" : "ghost";

      return {
        id: `root:${branch.id}`,
        from: { x: ROOT_NODE.x, y: ROOT_NODE.y },
        to: branch,
        tone,
      };
    }),
    ...disciplineBranches.flatMap((branch) =>
      branch.disciplines.map((discipline) => {
        const disciplineNode = disciplineNodes.find((node) => node.label === discipline)!;
        const tone: GraphLink["tone"] =
          discipline === selectedDiscipline
            ? "primary"
            : branch.id === selectedBranch?.id
              ? "secondary"
              : "ghost";

        return {
          id: `${branch.id}:${discipline}`,
          from: { x: branch.x, y: branch.y },
          to: disciplineNode,
          tone,
        };
      }),
    ),
  ];

  const activeCurriculumStage =
    isCurriculumExpanded
      ? resolveCurriculumStage(selectedDiscipline, selectedStage, selectedTopic)
      : null;
  const curriculumNode =
    isCurriculumExpanded
      ? disciplineNodes.find((node) => node.label === selectedDiscipline) ?? null
      : null;
  const curriculum = curriculumNode
    ? buildMathCurriculum(
        curriculumNode,
        selectedDiscipline,
        activeCurriculumStage?.level ?? null,
        selectedTopic,
      )
    : { stageNodes: [], topicNodes: [], links: [] };

  return {
    branchNodes,
    disciplineNodes,
    stageNodes: curriculum.stageNodes,
    topicNodes: curriculum.topicNodes,
    activeCurriculumStage,
    links: [...links, ...curriculum.links],
  };
}

function createSelectionKey(
  selectedDiscipline: string,
  selectedStage: string | null,
  selectedTopic: string | null,
) {
  if (selectedTopic) {
    return `topic:${selectedDiscipline}:${selectedStage ?? ""}:${selectedTopic}`;
  }

  if (selectedStage) {
    return `stage:${selectedDiscipline}:${selectedStage}`;
  }

  return `discipline:${selectedDiscipline}`;
}

function getFocusPoint(
  graph: GraphModel,
  selectedDiscipline: string,
  selectedStage: string | null,
  selectedTopic: string | null,
) {
  if (selectedTopic) {
    const activeTopicNode =
      graph.topicNodes.find(
        (topic) =>
          topic.label === selectedTopic &&
          (!selectedStage || topic.level === selectedStage),
      ) ?? null;

    if (activeTopicNode) {
      return { x: activeTopicNode.x, y: activeTopicNode.y };
    }
  }

  if (selectedStage) {
    const activeStageNode =
      graph.stageNodes.find((stage) => stage.level === selectedStage) ?? null;

    if (activeStageNode) {
      return { x: activeStageNode.x, y: activeStageNode.y };
    }
  }

  const activeDisciplineNode =
    graph.disciplineNodes.find((discipline) => discipline.label === selectedDiscipline) ?? null;

  if (activeDisciplineNode) {
    return { x: activeDisciplineNode.x, y: activeDisciplineNode.y };
  }

  const branch = findBranchByDiscipline(selectedDiscipline);
  return branch ? { x: branch.x, y: branch.y } : { x: ROOT_NODE.x, y: ROOT_NODE.y };
}

export function KnowledgeGraphCanvas(props: KnowledgeGraphCanvasProps) {
  const selectionKey = createSelectionKey(
    props.selectedDiscipline,
    props.selectedStage,
    props.selectedTopic,
  );
  const graph = buildGraph(
    props.selectedDiscipline,
    props.selectedStage,
    props.selectedTopic,
    props.isCurriculumExpanded,
  );
  const stageRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({
    scale: 1,
    selection: selectionKey,
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const focusPoint = getFocusPoint(
    graph,
    props.selectedDiscipline,
    props.selectedStage,
    props.selectedTopic,
  );
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setViewport((current) =>
        current.selection === selectionKey && current.x === 0 && current.y === 0
          ? current
          : {
              ...current,
              selection: selectionKey,
              x: 0,
              y: 0,
            },
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectionKey]);

  const activePanOffset =
    viewport.selection === selectionKey
      ? { x: viewport.x, y: viewport.y }
      : { x: 0, y: 0 };
  const zoomPercentage = Math.round(viewport.scale * 100);
  const viewportOffset = {
    x: activePanOffset.x + (ROOT_NODE.x - focusPoint.x) * viewport.scale,
    y: activePanOffset.y + (ROOT_NODE.y - focusPoint.y) * viewport.scale,
  };
  const activeSelection: GraphSelection = props.selectedTopic
    ? {
        kind: "topic",
        discipline: props.selectedDiscipline,
        stage:
          props.selectedStage ??
          resolveCurriculumStage(
            props.selectedDiscipline,
            props.selectedStage,
            props.selectedTopic,
          )?.level ??
          "1단계",
        topic: props.selectedTopic,
      }
    : props.selectedStage
      ? {
          kind: "stage",
          discipline: props.selectedDiscipline,
          stage: props.selectedStage,
          topic: null,
        }
      : {
          kind: "discipline",
          discipline: props.selectedDiscipline,
          stage: null,
          topic: null,
        };
  const activeSelectionPoint = props.selectedTopic
    ? graph.topicNodes.find(
        (topic) =>
          topic.label === props.selectedTopic &&
          (!props.selectedStage || topic.level === props.selectedStage),
      ) ?? null
    : props.selectedStage
      ? graph.stageNodes.find((stage) => stage.level === props.selectedStage) ?? null
      : graph.disciplineNodes.find((discipline) => discipline.label === props.selectedDiscipline) ?? null;

  function zoomTo(nextScale: number, originX = 0, originY = 0) {
    setViewport((current) => {
      const currentPan =
        current.selection === selectionKey
          ? { x: current.x, y: current.y }
          : { x: 0, y: 0 };
      const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));

      if (Math.abs(clampedScale - current.scale) < 0.001) {
        return current;
      }

      const ratio = clampedScale / current.scale;

      return {
        scale: clampedScale,
        selection: selectionKey,
        x: originX - (originX - currentPan.x) * ratio,
        y: originY - (originY - currentPan.y) * ratio,
      };
    });
  }

  function nudgeZoom(direction: "in" | "out") {
    zoomTo(viewport.scale * (direction === "in" ? ZOOM_STEP : 1 / ZOOM_STEP));
  }

  function resetView() {
    setViewport({
      scale: 1,
      selection: selectionKey,
      x: 0,
      y: 0,
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: activePanOffset.x,
      originY: activePanOffset.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    setViewport((current) => ({
      ...current,
      selection: selectionKey,
      x: dragStateRef.current.originX + (event.clientX - dragStateRef.current.startX),
      y: dragStateRef.current.originY + (event.clientY - dragStateRef.current.startY),
    }));
  }

  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current.pointerId = -1;
    setIsPanning(false);
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    event.preventDefault();

    const rect = stage.getBoundingClientRect();
    const pointerX = event.clientX - (rect.left + rect.width / 2);
    const pointerY = event.clientY - (rect.top + rect.height / 2);

    setViewport((current) => {
      const currentPan =
        current.selection === selectionKey
          ? { x: current.x, y: current.y }
          : { x: 0, y: 0 };
      const rawNextScale = current.scale * Math.exp(-event.deltaY * ZOOM_SENSITIVITY);
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, rawNextScale));

      if (Math.abs(nextScale - current.scale) < 0.001) {
        return current;
      }

      const ratio = nextScale / current.scale;

      return {
        scale: nextScale,
        selection: selectionKey,
        x: pointerX - (pointerX - currentPan.x) * ratio,
        y: pointerY - (pointerY - currentPan.y) * ratio,
      };
    });
  }

  return (
    <div
      ref={stageRef}
      className={`graph-stage graph-stage--pan ${isPanning ? "is-panning" : ""}`}
      role="group"
      aria-describedby="knowledge-graph-help"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onWheel={handleWheel}
    >
      <p id="knowledge-graph-help" className="sr-only">
        페이지 전체를 사용하는 대형 학문 캔버스입니다. 마우스로 드래그해서 위치를 이동할 수
        있고, 마우스 휠로 확대하거나 축소할 수 있으며, 학문과 커리큘럼 노드를 눌러
        포커스를 바꿀 수 있습니다.
      </p>

      <div
        className="knowledge-graph__hud"
        role="group"
        aria-label="그래프 확대와 축소"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="knowledge-graph__hud-button"
          onClick={() => nudgeZoom("out")}
          aria-label="그래프 축소"
        >
          -
        </button>
        <span className="knowledge-graph__hud-value" aria-live="polite">
          {zoomPercentage}%
        </span>
        <button
          type="button"
          className="knowledge-graph__hud-button"
          onClick={() => nudgeZoom("in")}
          aria-label="그래프 확대"
        >
          +
        </button>
        <button
          type="button"
          className="knowledge-graph__hud-button is-secondary"
          onClick={resetView}
        >
          기본
        </button>
      </div>

      <div
        className="graph-world"
        style={{
          width: `${GRAPH_WIDTH}px`,
          height: `${GRAPH_HEIGHT}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="graph-world__viewport"
          style={{
            transformOrigin: `${ROOT_NODE.x}px ${ROOT_NODE.y}px`,
            transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px) scale(${viewport.scale})`,
          }}
        >
          <svg
            className="knowledge-graph"
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            aria-hidden="true"
          >
            {graph.links.map((link) => (
              <line
                key={link.id}
                x1={link.from.x}
                y1={link.from.y}
                x2={link.to.x}
                y2={link.to.y}
                className={`knowledge-link knowledge-link--${link.tone}`}
              />
            ))}
          </svg>

          <div className="graph-node-layer">
            <div
              className="graph-node graph-node--root"
              style={{ left: `${ROOT_NODE.x}px`, top: `${ROOT_NODE.y}px` }}
              aria-hidden="true"
            >
              <span className="graph-node__core" />
              <span className="graph-node__label">{ROOT_NODE.label}</span>
            </div>

            {graph.branchNodes.map((branch) => (
              <div
                key={branch.id}
                className={`graph-node graph-node--branch ${branch.active ? "is-active" : ""}`}
                style={{ left: `${branch.x}px`, top: `${branch.y}px` }}
                aria-hidden="true"
              >
                <span className="graph-node__core" />
                <span className="graph-node__label">{branch.label}</span>
              </div>
            ))}

            {graph.disciplineNodes.map((discipline) => (
              <button
                key={discipline.label}
                type="button"
                className={`graph-node graph-node--discipline ${discipline.active ? "is-active" : ""} ${discipline.muted ? "is-muted" : ""}`}
                style={{ left: `${discipline.x}px`, top: `${discipline.y}px` }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  props.onSelectNode({
                    kind: "discipline",
                    discipline: discipline.label,
                    stage: null,
                    topic: null,
                  })
                }
                aria-label={`${discipline.label} 노드를 선택하기`}
                aria-pressed={discipline.active}
              >
                <span className="graph-node__core" />
                <span className="graph-node__label">{discipline.label}</span>
              </button>
            ))}

            {graph.stageNodes.map((stage) => (
              <button
                key={stage.level}
                type="button"
                className={`graph-node graph-node--stage ${stage.active ? "is-active" : ""}`}
                style={{ left: `${stage.x}px`, top: `${stage.y}px` }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  props.onSelectNode({
                    kind: "stage",
                    discipline: props.selectedDiscipline,
                    stage: stage.level,
                    topic: null,
                  })
                }
                aria-label={`${stage.level} 노드를 선택하기`}
                aria-pressed={stage.active}
              >
                <span className="graph-node__core" />
                <span className="graph-node__label">
                  {stage.level}
                  <small className="graph-node__meta">{stage.title}</small>
                </span>
              </button>
            ))}

            {graph.topicNodes.map((topic) => (
              <button
                key={`${topic.level}:${topic.label}`}
                type="button"
                className={`graph-node graph-node--topic ${topic.active ? "is-active" : ""} ${topic.muted ? "is-muted" : ""}`}
                style={{ left: `${topic.x}px`, top: `${topic.y}px` }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  props.onSelectNode({
                    kind: "topic",
                    discipline: props.selectedDiscipline,
                    stage: topic.level,
                    topic: topic.label,
                  })
                }
                aria-label={`${topic.label} 노드를 선택하기`}
                aria-pressed={topic.active}
              >
                <span className="graph-node__core" />
                <span className="graph-node__label">{topic.label}</span>
              </button>
            ))}

            {activeSelectionPoint ? (
              <button
                type="button"
                className="graph-node-read"
                style={{
                  left: `${activeSelectionPoint.x + 54}px`,
                  top: `${activeSelectionPoint.y - 24}px`,
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  props.onReadNode(activeSelection);
                }}
              >
                읽기
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
