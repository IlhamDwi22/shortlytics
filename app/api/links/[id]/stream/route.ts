import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Hard cap on concurrent SSE streams per user. This is in-memory (per server
// instance) — it prevents runaway connections on a single instance; a shared
// store (Redis) would be needed for a cluster.
const MAX_STREAMS_PER_USER = 5;
const activeStreams = new Map<string, number>();

/**
 * GET /api/links/:id/stream
 * Server-Sent Events (SSE) stream endpoint for real-time link click updates.
 */
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const userId = await requireUser();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await props.params;

    // 2. Ownership Verification (scoped — 404 for both missing & not-owned)
    const link = await prisma.link.findFirst({
      where: { id, userId },
      select: { id: true, userId: true },
    });

    if (!link) {
      return new Response("Not Found", { status: 404 });
    }

    // 3. Per-user connection cap (fail fast before opening the stream)
    const current = activeStreams.get(userId) || 0;
    if (current >= MAX_STREAMS_PER_USER) {
      return new Response("Too Many Streams", { status: 429 });
    }
    activeStreams.set(userId, current + 1);

    const encoder = new TextEncoder();

    // 4. Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;
        let lastCount = -1;
        let pollIntervalRef: ReturnType<typeof setInterval> | null = null;
        let heartbeatIntervalRef: ReturnType<typeof setInterval> | null = null;

        // Clean closure helper (releases the per-user slot + timers).
        const safeClose = () => {
          if (isClosed) return;
          isClosed = true;
          const remaining = activeStreams.get(userId) || 0;
          if (remaining > 1) {
            activeStreams.set(userId, remaining - 1);
          } else {
            activeStreams.delete(userId);
          }
          if (pollIntervalRef) clearInterval(pollIntervalRef);
          if (heartbeatIntervalRef) clearInterval(heartbeatIntervalRef);
          try {
            controller.close();
          } catch {
            // Ignore already closed controller errors
          }
        };

        const poll = () => {
          if (isClosed) return;
          prisma.click
            .count({ where: { linkId: link.id } })
            .then((count) => {
              if (isClosed || count === lastCount) return;
              const isInitial = lastCount === -1;
              lastCount = count;
              const payload = {
                type: isInitial ? "init" : "click",
                totalClicks: count,
                timestamp: new Date().toISOString(),
              };
              try {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
                );
              } catch {
                // Stream errored (client gone / reset) — stop polling.
                safeClose();
              }
            })
            .catch((err) => {
              console.error("SSE polling error:", err);
            });
        };

        // Send initial count immediately, then poll for changes.
        poll();

        pollIntervalRef = setInterval(poll, 2500);

        // Heartbeat comment every 15 seconds to keep connection alive
        heartbeatIntervalRef = setInterval(() => {
          if (isClosed) return;
          try {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          } catch {
            safeClose();
          }
        }, 15000);

        // Handle client disconnection / page navigation
        req.signal.addEventListener("abort", () => {
          safeClose();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store, no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("SSE Handler Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
