import EventEmitter from 'events';
import { writeError } from '../utils/log';
import { GamesEvent } from '../constants';
import { draw } from '../utils/array';
import gamesModel from '../model/games';
import ticketsModel from '../model/tickets';

class GamesEmitter extends EventEmitter {}
export const gamesEmitter = new GamesEmitter();

export type TGamePostData = { gameId: number; ticketId: number };

/**
 * Create a game record and draw ticket periodically
 */
export const drawInterval = () => {
  const GAME_MILLISECOND = parseInt(process.env.GAME_MILLISECOND || '100', 10);
  if (isNaN(GAME_MILLISECOND)) {
    writeError('GAME_MILLISECOND is not a valid number');
    process.exit(1);
  }

  setInterval(
    async () => {
      try {
        // Create a game record
        const { id: gameId } = await gamesModel.create();

        // Draw ticket for the current game
        const tickets = await ticketsModel.readTickets(gameId);
        const wonTicket = draw(tickets.rows);
        if (!wonTicket) {
          return;
        }

        // Store the won ticket to the game record
        await gamesModel.update(gameId, wonTicket.id);

        // Emit all listeners that are listening on GamesEvent.drawn
        const payload: TGamePostData = { gameId, ticketId: wonTicket.id };
        gamesEmitter.emit(GamesEvent.drawn, payload);
      } catch (err) {
        writeError(JSON.stringify(err));
        return;
      }
    },
    // Ensure not less than 1 second
    Math.max(GAME_MILLISECOND, 1000)
  );
};
