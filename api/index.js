// Vercel Function that serves the NestJS API, including Socket.IO over
// WebSocket. The app is compiled to apps/api/dist by the build command.
import { createServer } from '../apps/api/dist/serverless.js';

export default await createServer();
