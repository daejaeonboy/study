import { notFound } from "next/navigation";

import { WorkspaceView } from "@/components/views/workspace-view";
import { getTopics, getWorkspace } from "@/lib/repository";

export default async function WorkspacePage() {
  const [workspace, topics] = await Promise.all([
    getWorkspace("black-hole-bridge"),
    getTopics(),
  ]);

  if (!workspace) {
    notFound();
  }

  return <WorkspaceView workspace={workspace} topics={topics} />;
}
