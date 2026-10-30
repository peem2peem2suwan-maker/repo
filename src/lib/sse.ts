type SSEClient = {
  id: string;
  userId?: string;
  send: (event: string, data: any) => void;
};

// Global in-memory subscriber registry across API route invocations
const globalForSSE = globalThis as unknown as {
  sseClients: Set<SSEClient> | undefined;
};

const clients = globalForSSE.sseClients ?? new Set<SSEClient>();
if (process.env.NODE_ENV !== 'production') globalForSSE.sseClients = clients;

export function registerSSEClient(client: SSEClient) {
  clients.add(client);
  return () => {
    clients.delete(client);
  };
}

export function broadcastEvent(event: string, data: any, targetUserId?: string) {
  clients.forEach((client) => {
    if (!targetUserId || client.userId === targetUserId) {
      try {
        client.send(event, data);
      } catch (err) {
        console.error('Error sending SSE to client', client.id, err);
      }
    }
  });
}

export const RealtimeEvents = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_UPDATED: 'BOOKING_UPDATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_APPROVED: 'BOOKING_APPROVED',
  BOOKING_REJECTED: 'BOOKING_REJECTED',
  ROOM_STATUS_CHANGED: 'ROOM_STATUS_CHANGED',
  NOTIFICATION_NEW: 'NOTIFICATION_NEW',
} as const;
