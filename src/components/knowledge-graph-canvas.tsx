"use client";

import {
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

const GRAPH_WIDTH = 4000;
const GRAPH_HEIGHT = 2600;
const MIN_SCALE = 0.45;
const MAX_SCALE = 2.4;
const ZOOM_SENSITIVITY = 0.0014;
const ROOT_NODE = {
  label: "학문",
  x: GRAPH_WIDTH / 2,
  y: GRAPH_HEIGHT / 2,
};

type KnowledgeGraphCanvasProps = {
  selectedDiscipline: string;
  selectedStage: string | null;
  selectedTopic: string | null;
  onSelectNode: (selection: {
    discipline: string;
    stage?: string | null;
    topic?: string | null;
  }) => void;
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

function resolveMathStage(selectedStage: string | null, selectedTopic: string | null) {
  const mathStages = getDisciplineProfile("수학").stages ?? [];

  if (!mathStages.length) {
    return null;
  }

  if (selectedStage) {
    return mathStages.find((stage) => stage.level === selectedStage) ?? mathStages[0];
  }

  if (selectedTopic) {
    return mathStages.find((stage) => stage.topics.includes(selectedTopic)) ?? mathStages[0];
  }

  return mathStages[0];
}

function buildMathCurriculum(
  mathNode: DisciplineNode,
  activeStageLevel: string | null,
  selectedTopic: string | null,
) {
  const mathStages = getDisciplineProfile("수학").stages ?? [];
  const stageStartX = mathNode.x + 250;
  const stageStartY = mathNode.y - 330;
  const stageGapY = 215;
  const topicOffsetX = 250;
  const topicGapY = 38;

  const stageNodes: MathStageNode[] = mathStages.map((stage, index) => ({
    level: stage.level,
    title: stage.title,
    x: stageStartX + (index % 2) * 36,
    y: stageStartY + index * stageGapY,
    active: activeStageLevel === stage.level,
  }));

  const topicNodes: MathTopicNode[] = mathStages.flatMap((stage, stageIndex) => {
    const stageNode = stageNodes[stageIndex];
    const stackStartY = stageNode.y - ((stage.topics.length - 1) * topicGapY) / 2;

    return stage.topics.map((topic, topicIndex) => ({
      level: stage.level,
      label: topic,
      x: stageNode.x + topicOffsetX,
      y: stackStartY + topicIndex * topicGapY,
      active: selectedTopic === topic,
      muted: activeStageLevel ? stage.level !== activeStageLevel : false,
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

function buildGraph(selectedDiscipline: string, selectedStage: string | null, selectedTopic: string | null) {
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

  const activeMathStage =
    selectedDiscipline === "수학" ? resolveMathStage(selectedStage, selectedTopic) : null;
  const mathNode =
    selectedDiscipline === "수학"
      ? disciplineNodes.find((node) => node.label === "수학") ?? null
      : null;
  const mathCurriculum = mathNode
    ? buildMathCurriculum(mathNode, activeMathStage?.level ?? null, selectedTopic)
    : { stageNodes: [], topicNodes: [], links: [] };

  return {
    branchNodes,
    disciplineNodes,
    stageNodes: mathCurriculum.stageNodes,
    topicNodes: mathCurriculum.topicNodes,
    activeMathStage,
    links: [...links, ...mathCurriculum.links],
  };
}

function getFocusOffset(selectedDiscipline: string, scale: number) {
  const branch = findBranchByDiscipline(selectedDiscipline);
  const focusPoint = branch
    ? { x: branch.x, y: branch.y }
    : { x: ROOT_NODE.x, y: ROOT_NODE.y };

  return {
    x: (ROOT_NODE.x - focusPoint.x) * scale,
    y: (ROOT_NODE.y - focusPoint.y) * scale,
  };
}

export function KnowledgeGraphCanvas(props: KnowledgeGraphCanvasProps) {
  const graph = buildGraph(props.selectedDiscipline, props.selectedStage, props.selectedTopic);
  const stageRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({
    scale: 1,
    selection: props.selectedDiscipline,
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const dragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const focusOffset = getFocusOffset(props.selectedDiscipline, viewport.scale);
  const activePanOffset =
    viewport.selection === props.selectedDiscipline ? viewport : { x: 0, y: 0 };

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
      selection: props.selectedDiscipline,
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
        current.selection === props.selectedDiscipline
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
        selection: props.selectedDiscipline,
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
        있고, 마우스 휠로 확대하거나 축소할 수 있으며, 학문과 수학 커리큘럼 노드를 눌러
        포커스를 바꿀 수 있습니다.
      </p>

      <div
        className="graph-world"
        style={{
          width: `${GRAPH_WIDTH}px`,
          height: `${GRAPH_HEIGHT}px`,
          transform: `translate(-50%, -50%) translate(${focusOffset.x + activePanOffset.x}px, ${focusOffset.y + activePanOffset.y}px) scale(${viewport.scale})`,
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
                  discipline: discipline.label,
                  stage: discipline.label === "수학" ? graph.activeMathStage?.level ?? null : null,
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
                  discipline: "수학",
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
                  discipline: "수학",
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
        </div>
      </div>
    </div>
  );
}
