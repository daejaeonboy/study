export type LayerDepth = "light" | "core" | "deep";
export type VerificationStatus =
  | "generated"
  | "reviewing"
  | "verified"
  | "published"
  | "deprecated";
export type EditorialRole = "admin" | "editor" | "reviewer";
export type ReviewTaskStatus =
  | "pending"
  | "in_review"
  | "changes_requested"
  | "approved";

export interface TopicLayer {
  title: string;
  description: string;
  body: string[];
  keyIdeas: string[];
  questions?: string[];
  bridgePrompt: string;
}

export interface TopicSource {
  title: string;
  type: string;
  publisher: string;
  url: string;
  difficulty: string;
  trust: number;
  summary: string;
}

export interface CrossDomainLink {
  topicSlug: string;
  label: string;
  reason: string;
}

export interface Topic {
  slug: string;
  title: string;
  category: string;
  summary: string;
  importance: string;
  tags: string[];
  prerequisites: string[];
  related: string[];
  crossDomainLinks: CrossDomainLink[];
  layers: Record<LayerDepth, TopicLayer>;
  sources: TopicSource[];
  verificationStatus?: VerificationStatus;
  sourceOrigin?: string;
  revision?: number;
  importedAt?: string;
  lastReviewedAt?: string;
  editorialSummary?: string;
}

export type TopicDraft = Omit<
  Topic,
  | "verificationStatus"
  | "sourceOrigin"
  | "revision"
  | "importedAt"
  | "lastReviewedAt"
  | "editorialSummary"
>;

export interface TopicBundleReview {
  verificationStatus: VerificationStatus;
  sourceOrigin: string;
  revision: number;
  importedAt: string;
  lastReviewedAt?: string;
  editorialSummary: string;
}

export interface TopicBundle {
  topic: TopicDraft;
  review: TopicBundleReview;
}

export interface EditorialUser {
  id: string;
  displayName: string;
  email: string;
  role: EditorialRole;
}

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
}

export interface TopicAssignment {
  topicSlug: string;
  assigneeId: string;
  assignedById: string;
  assignedAt: string;
  note?: string;
}

export interface TopicReviewTask {
  id: string;
  topicSlug: string;
  status: ReviewTaskStatus;
  requesterId: string;
  reviewerId?: string;
  requestedAt: string;
  reviewedAt?: string;
  comment?: string;
}

export interface AdminTopicRecord {
  topic: Topic;
  assignee?: EditorialUser;
  assignedBy?: EditorialUser;
  assignment?: TopicAssignment;
  latestReviewTask?: TopicReviewTask;
}

export interface PathStep {
  topicSlug: string;
  depth: LayerDepth;
  status: "completed" | "current" | "suggested";
  note: string;
}

export interface LearningPath {
  slug: string;
  title: string;
  goal: string;
  startTopicSlug: string;
  currentTopicSlug: string;
  nextTopicSlugs: string[];
  steps: PathStep[];
}

export interface GuidePreset {
  id: string;
  label: string;
  query: string;
}

export interface GuideRecommendation {
  title: string;
  summary: string;
  recommendedDepth: LayerDepth;
  startTopicSlug: string;
  path: string[];
  bridges: string[];
  reasons: string[];
}

export interface WorkspaceSource {
  title: string;
  publisher: string;
  type: string;
  note: string;
}

export interface Workspace {
  slug: string;
  title: string;
  mode: string;
  focusQuestion: string;
  relatedDomains: string[];
  questionList: string[];
  debateMap: Array<{
    title: string;
    detail: string;
  }>;
  savedTopicSlugs: string[];
  savedSources: WorkspaceSource[];
  noteBlocks: string[];
}
