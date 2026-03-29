-- PostgreSQL starter schema for Intelligent Knowledge Library

create extension if not exists "pgcrypto";

create table if not exists topics (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    summary text not null,
    importance_reason text,
    category text not null,
    tags jsonb not null default '[]'::jsonb,
    estimated_difficulty smallint not null default 1 check (estimated_difficulty between 1 and 5),
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    verification_status text not null default 'generated' check (
        verification_status in ('generated', 'reviewing', 'verified', 'published', 'deprecated')
    ),
    source_origin text not null default 'legacy-seed',
    revision integer not null default 1,
    imported_at timestamptz not null default now(),
    last_reviewed_at timestamptz,
    editorial_summary text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table topics add column if not exists verification_status text not null default 'generated';
alter table topics add column if not exists source_origin text not null default 'legacy-seed';
alter table topics add column if not exists revision integer not null default 1;
alter table topics add column if not exists imported_at timestamptz not null default now();
alter table topics add column if not exists last_reviewed_at timestamptz;
alter table topics add column if not exists editorial_summary text;

create table if not exists topic_bundle_revisions (
    id uuid primary key default gen_random_uuid(),
    topic_slug text not null,
    revision integer not null,
    verification_status text not null default 'generated' check (
        verification_status in ('generated', 'reviewing', 'verified', 'published', 'deprecated')
    ),
    source_origin text not null,
    editorial_summary text,
    bundle_payload jsonb not null,
    imported_at timestamptz not null default now(),
    last_reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    unique (topic_slug, revision)
);

create table if not exists topic_layers (
    id uuid primary key default gen_random_uuid(),
    topic_id uuid not null references topics(id) on delete cascade,
    depth text not null check (depth in ('light', 'core', 'deep')),
    title text not null,
    learning_time_minutes integer not null default 3,
    body_markdown text not null,
    key_takeaways jsonb not null default '[]'::jsonb,
    bridge_prompt text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (topic_id, depth)
);

create table if not exists topic_relations (
    id uuid primary key default gen_random_uuid(),
    from_topic_id uuid not null references topics(id) on delete cascade,
    to_topic_id uuid not null references topics(id) on delete cascade,
    relation_type text not null check (
        relation_type in (
            'prerequisite',
            'related',
            'broader',
            'narrower',
            'application_of',
            'debate_with',
            'cross_domain',
            'historical_context'
        )
    ),
    strength smallint not null default 3 check (strength between 1 and 5),
    reason_text text,
    created_at timestamptz not null default now(),
    unique (from_topic_id, to_topic_id, relation_type)
);

create table if not exists topic_sources (
    id uuid primary key default gen_random_uuid(),
    topic_id uuid not null references topics(id) on delete cascade,
    title text not null,
    source_type text not null check (
        source_type in (
            'encyclopedia',
            'overview_article',
            'open_course',
            'primary_text',
            'paper',
            'review_paper',
            'dataset',
            'reference'
        )
    ),
    url text not null,
    publisher text,
    difficulty_level text not null default 'introductory' check (
        difficulty_level in ('introductory', 'intermediate', 'advanced', 'research')
    ),
    trust_score smallint not null default 3 check (trust_score between 1 and 5),
    short_summary text,
    language_code text not null default 'ko',
    published_at date,
    accessed_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    display_name text,
    created_at timestamptz not null default now()
);

create table if not exists editorial_users (
    id text primary key,
    display_name text not null,
    email text not null unique,
    role text not null check (role in ('admin', 'editor', 'reviewer')),
    created_at timestamptz not null default now()
);

create table if not exists topic_assignments (
    topic_slug text not null,
    assignee_id text not null references editorial_users(id) on delete cascade,
    assigned_by_id text not null references editorial_users(id) on delete cascade,
    assigned_at timestamptz not null default now(),
    note text,
    primary key (topic_slug)
);

create table if not exists topic_review_tasks (
    id text primary key,
    topic_slug text not null,
    status text not null check (status in ('pending', 'in_review', 'changes_requested', 'approved')),
    requester_id text not null references editorial_users(id) on delete cascade,
    reviewer_id text references editorial_users(id) on delete set null,
    requested_at timestamptz not null default now(),
    reviewed_at timestamptz,
    comment text
);

create table if not exists user_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    last_viewed_layer text not null default 'light' check (last_viewed_layer in ('light', 'core', 'deep')),
    viewed_layers jsonb not null default '[]'::jsonb,
    completion_score numeric(5,2) not null default 0,
    last_viewed_at timestamptz not null default now(),
    next_recommended_topic_id uuid references topics(id),
    unique (user_id, topic_id)
);

create table if not exists user_bookmarks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (user_id, topic_id)
);

create table if not exists user_notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    layer_depth text check (layer_depth in ('light', 'core', 'deep')),
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists learning_paths (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    title text not null,
    goal text,
    start_topic_id uuid references topics(id),
    current_topic_id uuid references topics(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists learning_path_steps (
    id uuid primary key default gen_random_uuid(),
    path_id uuid not null references learning_paths(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    layer_depth text not null default 'light' check (layer_depth in ('light', 'core', 'deep')),
    step_order integer not null,
    step_status text not null default 'suggested' check (step_status in ('suggested', 'started', 'completed', 'skipped')),
    note text,
    unique (path_id, step_order)
);

create table if not exists workspaces (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    title text not null,
    focus_question text,
    notes text,
    related_domains jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists workspace_topics (
    workspace_id uuid not null references workspaces(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    added_at timestamptz not null default now(),
    primary key (workspace_id, topic_id)
);

create table if not exists workspace_sources (
    workspace_id uuid not null references workspaces(id) on delete cascade,
    source_id uuid not null references topic_sources(id) on delete cascade,
    added_at timestamptz not null default now(),
    primary key (workspace_id, source_id)
);

create index if not exists idx_topics_category on topics(category);
create index if not exists idx_topics_verification_status on topics(verification_status);
create index if not exists idx_topic_bundle_revisions_slug on topic_bundle_revisions(topic_slug, revision desc);
create index if not exists idx_topic_assignments_assignee on topic_assignments(assignee_id, assigned_at desc);
create index if not exists idx_topic_review_tasks_status on topic_review_tasks(status, requested_at desc);
create index if not exists idx_topic_relations_from on topic_relations(from_topic_id, relation_type);
create index if not exists idx_topic_sources_topic on topic_sources(topic_id);
create index if not exists idx_user_progress_user on user_progress(user_id, last_viewed_at desc);
create index if not exists idx_user_bookmarks_user on user_bookmarks(user_id, created_at desc);
