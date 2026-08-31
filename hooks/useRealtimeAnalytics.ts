"use client";

import { useEffect, useState, useRef } from "react";

export interface RealtimeEventPayload {
  type: "init" | "click";
  totalClicks: number;
  timestamp: string;
}

export interface UseRealtimeAnalyticsOptions {
  onNewClick?: (totalClicks: number) => void;
  initialTotalClicks?: number;
}

export function useRealtimeAnalytics(
  linkId: string | null | undefined,
  options?: UseRealtimeAnalyticsOptions
) {
  const [totalClicks, setTotalClicks] = useState<number>(
    options?.initialTotalClicks || 0
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);

  // Store onNewClick in a ref to avoid recreating the eventSource on callback changes
  const onNewClickRef = useRef(options?.onNewClick);
  useEffect(() => {
    onNewClickRef.current = options?.onNewClick;
  }, [options?.onNewClick]);

  useEffect(() => {
    if (!linkId) return;

    let eventSource: EventSource | null = null;
    let isCancelled = false;

    try {
      eventSource = new EventSource(`/api/links/${linkId}/stream`);

      eventSource.onopen = () => {
        if (!isCancelled) {
          setIsConnected(true);
        }
      };

      eventSource.onmessage = (event) => {
        if (isCancelled || !event.data) return;

        try {
          const data: RealtimeEventPayload = JSON.parse(event.data);
          setTotalClicks(data.totalClicks);
          setLastEventTime(data.timestamp);

          if (data.type === "click" && onNewClickRef.current) {
            onNewClickRef.current(data.totalClicks);
          }
        } catch {
          // Ignore parse errors (e.g. heartbeats)
        }
      };

      eventSource.onerror = () => {
        if (!isCancelled) {
          setIsConnected(false);
        }
      };
    } catch (err) {
      console.warn("Failed to establish SSE connection:", err);
    }

    return () => {
      isCancelled = true;
      if (eventSource) {
        eventSource.close();
      }
      setIsConnected(false);
    };
  }, [linkId]);

  return {
    totalClicks,
    isConnected,
    lastEventTime,
  };
}
