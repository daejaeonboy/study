"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { useAppUser } from "@/components/providers/app-user-provider";
import type { LayerDepth } from "@/lib/domain";
import {
  defaultGuestLibrarySnapshot,
  type LibraryMutation,
  type LibrarySnapshot,
} from "@/lib/library-state";

const STORAGE_KEYS = {
  saved: "ikl.savedTopicSlugs",
  recent: "ikl.recentTopicSlugs",
  notes: "ikl.topicNotes",
  layers: "ikl.topicLayers",
};

type LibraryContextValue = {
  savedSlugs: string[];
  recentSlugs: string[];
  notes: Record<string, string>;
  layerProgress: Record<string, LayerDepth>;
  toggleSave: (topicSlug: string) => void;
  markRecent: (topicSlug: string) => void;
  setNote: (topicSlug: string, value: string, depth?: LayerDepth) => void;
  setLayerProgress: (topicSlug: string, depth: LayerDepth) => void;
};

const listeners = new Set<() => void>();
const LibraryContext = createContext<LibraryContextValue | null>(null);
let guestMemorySnapshot: LibrarySnapshot = defaultGuestLibrarySnapshot;
let guestStorageCache = {
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

function readGuestSnapshot(): LibrarySnapshot {
  if (typeof window === "undefined") {
    return guestMemorySnapshot;
  }

  try {
    const nextCache = {
      saved: window.localStorage.getItem(STORAGE_KEYS.saved),
      recent: window.localStorage.getItem(STORAGE_KEYS.recent),
      notes: window.localStorage.getItem(STORAGE_KEYS.notes),
      layers: window.localStorage.getItem(STORAGE_KEYS.layers),
    };

    if (
      nextCache.saved === guestStorageCache.saved &&
      nextCache.recent === guestStorageCache.recent &&
      nextCache.notes === guestStorageCache.notes &&
      nextCache.layers === guestStorageCache.layers
    ) {
      return guestMemorySnapshot;
    }

    guestStorageCache = nextCache;
    guestMemorySnapshot = {
      savedSlugs: parseJson(nextCache.saved, defaultGuestLibrarySnapshot.savedSlugs),
      recentSlugs: parseJson(nextCache.recent, defaultGuestLibrarySnapshot.recentSlugs),
      notes: parseJson(nextCache.notes, defaultGuestLibrarySnapshot.notes),
      layerProgress: parseJson(nextCache.layers, defaultGuestLibrarySnapshot.layerProgress),
    };
  } catch {
    return guestMemorySnapshot;
  }

  return guestMemorySnapshot;
}

function getGuestServerSnapshot() {
  return guestMemorySnapshot;
}

function subscribeGuestSnapshot(listener: () => void) {
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

function emitGuestSnapshotChange() {
  listeners.forEach((listener) => listener());
}

function writeGuestSnapshot(snapshot: LibrarySnapshot) {
  const saved = JSON.stringify(snapshot.savedSlugs);
  const recent = JSON.stringify(snapshot.recentSlugs);
  const notes = JSON.stringify(snapshot.notes);
  const layers = JSON.stringify(snapshot.layerProgress);

  guestMemorySnapshot = snapshot;
  guestStorageCache = {
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
    // Ignore browser storage write failures and keep the in-memory guest snapshot.
  }

  emitGuestSnapshotChange();
}

function applyMutation(snapshot: LibrarySnapshot, mutation: LibraryMutation): LibrarySnapshot {
  switch (mutation.type) {
    case "toggle-save":
      return {
        ...snapshot,
        savedSlugs: snapshot.savedSlugs.includes(mutation.topicSlug)
          ? snapshot.savedSlugs.filter((slug) => slug !== mutation.topicSlug)
          : [mutation.topicSlug, ...snapshot.savedSlugs],
      };
    case "mark-recent":
      return {
        ...snapshot,
        recentSlugs: [
          mutation.topicSlug,
          ...snapshot.recentSlugs.filter((slug) => slug !== mutation.topicSlug),
        ].slice(0, 6),
      };
    case "set-note": {
      const nextNotes = { ...snapshot.notes };

      if (mutation.value.length) {
        nextNotes[mutation.topicSlug] = mutation.value;
      } else {
        delete nextNotes[mutation.topicSlug];
      }

      return {
        ...snapshot,
        notes: nextNotes,
      };
    }
    case "set-layer-progress":
      return {
        ...snapshot,
        layerProgress: {
          ...snapshot.layerProgress,
          [mutation.topicSlug]: mutation.depth,
        },
        recentSlugs: [
          mutation.topicSlug,
          ...snapshot.recentSlugs.filter((slug) => slug !== mutation.topicSlug),
        ].slice(0, 6),
      };
    default:
      return snapshot;
  }
}

function mergeServerSnapshot(
  current: LibrarySnapshot,
  next: LibrarySnapshot,
  dirtyNoteSlugs: Set<string>,
) {
  if (!dirtyNoteSlugs.size) {
    return next;
  }

  const mergedNotes = { ...next.notes };

  dirtyNoteSlugs.forEach((topicSlug) => {
    if (topicSlug in current.notes) {
      mergedNotes[topicSlug] = current.notes[topicSlug];
      return;
    }

    delete mergedNotes[topicSlug];
  });

  return {
    ...next,
    notes: mergedNotes,
  };
}

async function postLibraryMutation(mutation: LibraryMutation) {
  const response = await fetch("/api/library", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mutation),
  });

  if (!response.ok) {
    throw new Error("Failed to sync library state.");
  }

  return (await response.json()) as LibrarySnapshot;
}

export function LibraryProvider({
  children,
  initialSnapshot,
}: {
  children: ReactNode;
  initialSnapshot: LibrarySnapshot;
}) {
  const appUser = useAppUser();
  const guestSnapshot = useSyncExternalStore(
    subscribeGuestSnapshot,
    readGuestSnapshot,
    getGuestServerSnapshot,
  );
  const [remoteSnapshot, setRemoteSnapshot] = useState(initialSnapshot);
  const latestSyncIdRef = useRef(0);
  const dirtyNoteSlugsRef = useRef(new Set<string>());
  const noteSyncTimersRef = useRef(new Map<string, number>());
  const snapshot = appUser ? remoteSnapshot : guestSnapshot;

  function clearNoteSyncTimers() {
    noteSyncTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    noteSyncTimersRef.current.clear();
  }

  useEffect(() => {
    return () => {
      clearNoteSyncTimers();
    };
  }, []);

  function syncMutation(mutation: LibraryMutation) {
    if (!appUser) {
      return;
    }

    const syncId = ++latestSyncIdRef.current;

    void postLibraryMutation(mutation)
      .then((nextSnapshot) => {
        if (syncId !== latestSyncIdRef.current) {
          return;
        }

        setRemoteSnapshot((current) =>
          mergeServerSnapshot(current, nextSnapshot, dirtyNoteSlugsRef.current),
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function scheduleNoteSync(mutation: Extract<LibraryMutation, { type: "set-note" }>) {
    if (!appUser) {
      return;
    }

    dirtyNoteSlugsRef.current.add(mutation.topicSlug);

    const existingTimer = noteSyncTimersRef.current.get(mutation.topicSlug);

    if (typeof existingTimer === "number") {
      window.clearTimeout(existingTimer);
    }

    const timerId = window.setTimeout(() => {
      noteSyncTimersRef.current.delete(mutation.topicSlug);

      const syncId = ++latestSyncIdRef.current;

      void postLibraryMutation(mutation)
        .then((nextSnapshot) => {
          dirtyNoteSlugsRef.current.delete(mutation.topicSlug);

          if (syncId !== latestSyncIdRef.current) {
            return;
          }

          setRemoteSnapshot((current) =>
            mergeServerSnapshot(current, nextSnapshot, dirtyNoteSlugsRef.current),
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }, 450);

    noteSyncTimersRef.current.set(mutation.topicSlug, timerId);
  }

  function commitGuestMutation(mutation: LibraryMutation) {
    const nextSnapshot = applyMutation(readGuestSnapshot(), mutation);
    writeGuestSnapshot(nextSnapshot);
  }

  function commitMutation(mutation: LibraryMutation) {
    if (!appUser) {
      commitGuestMutation(mutation);
      return;
    }

    startTransition(() => {
      setRemoteSnapshot((current) => applyMutation(current, mutation));
    });

    if (mutation.type === "set-note") {
      scheduleNoteSync(mutation);
      return;
    }

    syncMutation(mutation);
  }

  const value: LibraryContextValue = {
    savedSlugs: snapshot.savedSlugs,
    recentSlugs: snapshot.recentSlugs,
    notes: snapshot.notes,
    layerProgress: snapshot.layerProgress,
    toggleSave(topicSlug) {
      commitMutation({
        type: "toggle-save",
        topicSlug,
      });
    },
    markRecent(topicSlug) {
      commitMutation({
        type: "mark-recent",
        topicSlug,
      });
    },
    setNote(topicSlug, value, depth) {
      commitMutation({
        type: "set-note",
        topicSlug,
        value,
        depth,
      });
    },
    setLayerProgress(topicSlug, depth) {
      if (snapshot.layerProgress[topicSlug] === depth) {
        return;
      }

      commitMutation({
        type: "set-layer-progress",
        topicSlug,
        depth,
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
