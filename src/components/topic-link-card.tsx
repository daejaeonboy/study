import Link from "next/link";

import type { Topic } from "@/lib/domain";

export function TopicLinkCard({
  topic,
  description,
}: {
  topic: Topic;
  description?: string;
}) {
  return (
    <Link 
      href={`/topic/${topic.slug}`} 
      className="list-card card-interactive" 
      aria-label={`Open topic ${topic.title}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span className="caption" style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>CONNECTED</span>
        <span className="chip" style={{ fontSize: '0.55rem', padding: '1px 6px' }}>{topic.category}</span>
      </div>
      <strong style={{ fontSize: '0.9rem', color: 'var(--text-strong)', fontWeight: 700 }}>{topic.title}</strong>
      <p className="muted" style={{ fontSize: '0.75rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description ?? topic.summary}
      </p>
    </Link>
  );
}
