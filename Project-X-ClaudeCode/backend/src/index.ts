import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app';
import { initializeSocket } from './socket';

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`ChessAlive backend running on port ${PORT}`);
});
