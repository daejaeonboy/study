"use client";

import { createContext, startTransition, useContext, useSyncExternalStore, type ReactNode } from "react";

import type { LayerDepth } from "@/lib/domain";

const STORAGE_KEYS = {
  saved: "ikl.savedTopicSlugs",
  recent: "ikl.recentTopicSlugs",
  notes: "ikl.topicNotes",
  layers: "ikl.topicLayers",
};

const defaultSnapshot = {
  savedSlugs: ["black-hole", "philosophy-of-science"],
  recentSlugs: ["black-hole", "scientific-revolution", "french-revolution"],
  notes: {
    "black-hole":
      "블랙홀은 단독 설명보다 중력 -> 시공간 -> 일반상대성이론 순서가 더 자연스럽다.",
    "french-revolution":
      "사건 연표만 보여주지 말고 민주주의로 넘어가는 다리를 같이 보여줘야 한다.",
  } as Record<string, string>,
  layerProgress: {
    "black-hole": "core",
    "scientific-revolution": "light",
    "french-revolution": "light",
  } as Record<string, LayerDepth>,
};

type LibrarySnapshot = typeof defaultSnapshot;

type LibraryContextValue = {
  savedSlugs: string[];
  recentSlugs: string[];
  notes: Record<string, string>;
  layerProgress: Record<string, LayerDepth>;
  toggleSave: (topicSlug: string) => void;
  markRecent: (topicSlug: string) => void;
  setNote: (topicSlug: string, value: string) => void;
  setLayerProgress: (topicSlug: string, depth: LayerDepth) => void;
};

const listeners = new Set<() => void>();
const LibraryContext = createContext<LibraryContextValue | null>(null);
let memorySnapshot: LibrarySnapshot = defaultSnapshot;
let storageCache = {
  saved: null as string | null,
  recent: null as string | null,
  notes: null as string | null,
  layers: null as string | null,
};

function parseJson<T>(raw: string | null, fallback: T) {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getSnapshot(): LibrarySnapshot {
  if (typeof window === "undefined") {
    return memorySnapshot;
  }

  try {
    const nextCache = {
      saved: window.localStorage.getItem(STORAGE_KEYS.saved),
      recent: window.localStorage.getItem(STORAGE_KEYS.recent),
      notes: window.localStorage.getItem(STORAGE_KEYS.notes),
      layers: window.localStorage.getItem(STORAGE_KEYS.layers),
    };

    if (
      nextCache.saved === storageCache.saved &&
      nextCache.recent === storageCache.recent &&
      nextCache.notes === storageCache.notes &&
      nextCache.layers === storageCache.layers
    ) {
      return memorySnapshot;
    }

    storageCache = nextCache;
    memorySnapshot = {
      savedSlugs: parseJson(nextCache.saved, defaultSnapshot.savedSlugs),
      recentSlugs: parseJson(nextCache.recent, defaultSnapshot.recentSlugs),
      notes: parseJson(nextCache.notes, defaultSnapshot.notes),
      layerProgress: parseJson(nextCache.layers, defaultSnapshot.layerProgress),
    };
  } catch {
    return memorySnapshot;
  }

  return memorySnapshot;
}

function getServerSnapshot(): LibrarySnapshot {
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

function writeSnapshot(snapshot: LibrarySnapshot) {
  const saved = JSON.stringify(snapshot.savedSlugs);
  const recent = JSON.stringify(snapshot.recentSlugs);
  const notes = JSON.stringify(snapshot.notes);
  const layers = JSON.stringify(snapshot.layerProgress);

  memorySnapshot = snapshot;
  storageCache = {
    saved,
    recent,
    notes,
    layers,
  };

  try {
    window.localStorage.setItem(STORAGE_KEYS.saved, saved);
    window.localStorage.setItem(STORAGE_KEYS.recent, recent);
    window.localStorage.setItem(STORAGE_KEYS.notes, notes);
    window.localStorage.setItem(STORAGE_KEYS.layers, layers);
  } catch {
    // Storage may be blocked by browser policy or stale extension state; keep the in-memory snapshot alive.
  }

  emitChange();
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value: LibraryContextValue = {
    savedSlugs: snapshot.savedSlugs,
    recentSlugs: snapshot.recentSlugs,
    notes: snapshot.notes,
    layerProgress: snapshot.layerProgress,
    toggleSave(topicSlug) {
      startTransition(() => {
        writeSnapshot({
          ...snapshot,
          savedSlugs: snapshot.savedSlugs.includes(topicSlug)
            ? snapshot.savedSlugs.filter((slug) => slug !== topicSlug)
            : [topicSlug, ...snapshot.savedSlugs],
        });
      });
    },
    markRecent(topicSlug) {
      startTransition(() => {
        writeSnapshot({
          ...snapshot,
          recentSlugs: [topicSlug, ...snapshot.recentSlugs.filter((slug) => slug !== topicSlug)].slice(0, 6),
        });
      });
    },
    setNote(topicSlug, value) {
      writeSnapshot({
        ...snapshot,
        notes: {
          ...snapshot.notes,
          [topicSlug]: value,
        },
      });
    },
    setLayerProgress(topicSlug, depth) {
      if (snapshot.layerProgress[topicSlug] === depth) {
        return;
      }

      startTransition(() => {
        writeSnapshot({
          ...snapshot,
          layerProgress: {
            ...snapshot.layerProgress,
            [topicSlug]: depth,
          },
        });
      });
    },
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }

  return context;
}
