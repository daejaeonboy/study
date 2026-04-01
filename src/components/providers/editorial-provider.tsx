"use client";

import {
  createContext,
  startTransition,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { Topic } from "@/lib/domain";

const STORAGE_KEY = "ikl.editorialTopicOverrides";

type EditorialSnapshot = Record<string, Topic>;

type EditorialContextValue = {
  overrides: EditorialSnapshot;
  getTopic: (topic: Topic) => Topic;
  saveTopic: (topic: Topic) => void;
  resetTopic: (slug: string) => void;
  hasOverride: (slug: string) => boolean;
};

const listeners = new Set<() => void>();
const EditorialContext = createContext<EditorialContextValue | null>(null);
let memorySnapshot: EditorialSnapshot = {};
let storageCache: string | null = null;

function parseJson<T>(raw: string | null, fallback: T) {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getSnapshot(): EditorialSnapshot {
  if (typeof window === "undefined") {
    return memorySnapshot;
  }

  try {
    const nextRaw = window.localStorage.getItem(STORAGE_KEY);

    if (nextRaw === storageCache) {
      return memorySnapshot;
    }

    storageCache = nextRaw;
    memorySnapshot = parseJson<EditorialSnapshot>(nextRaw, {});
  } catch {
    return memorySnapshot;
  }

  return memorySnapshot;
}

function getServerSnapshot(): EditorialSnapshot {
  return memorySnapshot;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function handleStorage() {
    listener();
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function writeSnapshot(snapshot: EditorialSnapshot) {
  const serialized = JSON.stringify(snapshot);

  memorySnapshot = snapshot;
  storageCache = serialized;

  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Keep the in-memory snapshot if storage is blocked.
  }

  emitChange();
}

export function EditorialProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value: EditorialContextValue = {
    overrides: snapshot,
    getTopic(topic) {
      return snapshot[topic.slug] ?? topic;
    },
    saveTopic(topic) {
      startTransition(() => {
        writeSnapshot({
          ...snapshot,
          [topic.slug]: topic,
        });
      });
    },
    resetTopic(slug) {
      if (!snapshot[slug]) {
        return;
      }

      startTransition(() => {
        const nextSnapshot = { ...snapshot };
        delete nextSnapshot[slug];
        writeSnapshot(nextSnapshot);
      });
    },
    hasOverride(slug) {
      return Boolean(snapshot[slug]);
    },
  };

  return <EditorialContext.Provider value={value}>{children}</EditorialContext.Provider>;
}

export function useEditorial() {
  const context = useContext(EditorialContext);

  if (!context) {
    throw new Error("useEditorial must be used within EditorialProvider");
  }

  return context;
}
