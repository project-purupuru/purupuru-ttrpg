import type { ActivityEvent, ActivityStream } from "./types";

export const mockActivityStream: ActivityStream = {
  subscribe(_cb: (e: ActivityEvent) => void): () => void {
    return () => {};
  },
  recent(_n?: number): ActivityEvent[] {
    return [];
  },
};
