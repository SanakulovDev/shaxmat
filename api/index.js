// Vercel Function that serves the NestJS API, including Socket.IO over
// WebSocket. The build bundles the API into apps/api/dist-vercel.
import { createServer } from '../apps/api/dist-vercel/server.mjs';

export default await createServer();
