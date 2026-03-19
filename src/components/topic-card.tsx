import Link from "next/link";

import type { LayerDepth, Topic } from "@/lib/domain";
import { formatDepth } from "@/lib/utils";

type TopicCardProps = {
  topic: Topic;
  isSaved?: boolean;
  onToggleSave?: (topicSlug: string) => void;
  progressDepth?: LayerDepth;
};

export function TopicCard({ topic, isSaved, onToggleSave, progressDepth }: TopicCardProps) {
  const progressLabel = progressDepth ? formatDepth(progressDepth) : "Light";

  return (
    <Link href={`/topic/${topic.slug}`} className="topic-card card-interactive" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="chip-row">
          <span className="chip chip--alt" style={{ fontSize: '0.65rem' }}>{topic.category}</span>
          <span className={`chip ${progressDepth ? "chip--accent" : ""}`} style={{ fontSize: '0.65rem' }}>
            {progressLabel}
          </span>
        </div>
        {onToggleSave ? (
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700 }}
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(topic.slug);
            }}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        ) : null}
      </div>
      
      <div className="stack" style={{ gap: '6px' }}>
        <span className="caption" style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>RESEARCH NOTE</span>
        <h3 className="section-title" style={{ fontSize: '1.15rem', fontWeight: 800 }}>{topic.title}</h3>
        <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {topic.summary}
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="caption" style={{ opacity: 0.6, fontSize: '0.6rem' }}>
          {topic.related.length} Links · {topic.sources.length} Sources
        </span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-strong)' }}>
          Research →
        </span>
      </div>
    </Link>
  );
}
