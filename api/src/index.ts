import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './config/swagger.json';

import ticketsRouter from './router/tickets';

import { write } from './utils/log';
import { drawInterval } from './emitter/gamesEmitter';

const app = express();

// Middleware configuration
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// Router setup
app.use('/tickets', ticketsRouter);
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Application startup
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  // Initialize event emitter for game drawing
  drawInterval();

  // Write the start-up log and display running port
  write('start.txt', `Running on port: ${PORT}`);
  console.log(`API is running on http://localhost:${PORT}`);
});
