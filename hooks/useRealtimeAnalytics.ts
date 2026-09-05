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
    options?.initialTotalClicks ?? 0
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);

  // Tracks whether the SSE stream has delivered data. Before the first event
  // (or when SSE is permanently offline) we surface `initialTotalClicks`
  // (e.g. from the link detail API) instead of a hard-coded 0.
  const hasReceivedEventRef = useRef(false);

  // Store onNewClick in a ref to avoid recreating the eventSource on callback changes
  const onNewClickRef = useRef(options?.onNewClick);
  useEffect(() => {
    onNewClickRef.current = options?.onNewClick;
  }, [options?.onNewClick]);

  // Fallback: while SSE has delivered nothing, mirror the initial value so the
  // counter never shows 0 when real data exists (e.g. SSE fails to connect).
  useEffect(() => {
    if (!hasReceivedEventRef.current) {
      setTotalClicks(options?.initialTotalClicks ?? 0);
    }
  }, [options?.initialTotalClicks]);

  useEffect(() => {
    if (!linkId) return;

    let eventSource: EventSource | null = null;
    let isCancelled = false;
    let errorCount = 0;
    const MAX_RECONNECTS = 5;

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
          hasReceivedEventRef.current = true;
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
        if (isCancelled) return;
        setIsConnected(false);
        // Stop reconnecting after repeated failures (e.g. 401/403/404 or the
        // link was deleted) instead of polling forever with backoff.
        errorCount++;
        if (errorCount >= MAX_RECONNECTS && eventSource) {
          eventSource.close();
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
