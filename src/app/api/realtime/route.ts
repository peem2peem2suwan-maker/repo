import { NextRequest } from 'next/server';
import { registerSSEClient } from '@/lib/sse';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connect greeting
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ clientId, status: 'connected' })}\n\n`));

      const send = (event: string, data: any) => {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (e) {
          console.error('Failed to stream SSE data:', e);
        }
      };

      const unregister = registerSSEClient({
        id: clientId,
        userId: user?.id,
        send,
      });

      // Keepalive ping every 25 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(interval);
          unregister();
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unregister();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
