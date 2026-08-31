import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await props.params;

    // 2. Ownership Verification
    const link = await prisma.link.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!link || link.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const encoder = new TextEncoder();

    // 3. Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;
        let lastCount = -1;

        // Clean closure helper
        const safeClose = () => {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch {
              // Ignore already closed controller errors
            }
          }
        };

        const checkAndUpdate = async (isInitial = false) => {
          if (isClosed) return;
          try {
            const currentCount = await prisma.click.count({
              where: { linkId: link.id },
            });

            // Send event if count changed or on initial connection
            if (isInitial || currentCount !== lastCount) {
              lastCount = currentCount;
              const payload = {
                type: isInitial ? "init" : "click",
                totalClicks: currentCount,
                timestamp: new Date().toISOString(),
              };

              const message = `data: ${JSON.stringify(payload)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }
          } catch (err) {
            console.error("SSE polling error:", err);
          }
        };

        // Send initial state immediately
        await checkAndUpdate(true);

        // Check for new clicks every 2.5 seconds
        const pollInterval = setInterval(() => {
          checkAndUpdate(false);
        }, 2500);

        // Heartbeat comment every 15 seconds to keep connection alive
        const heartbeatInterval = setInterval(() => {
          if (!isClosed) {
            try {
              controller.enqueue(encoder.encode(": heartbeat\n\n"));
            } catch {
              safeClose();
            }
          }
        }, 15000);

        // Handle client disconnection / page navigation
        req.signal.addEventListener("abort", () => {
          clearInterval(pollInterval);
          clearInterval(heartbeatInterval);
          safeClose();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("SSE Handler Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
