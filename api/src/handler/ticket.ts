import type { Handler } from 'express';

import { TGamePostData, gamesEmitter } from '../emitter/gamesEmitter';
import { PgErrorCodes, TicketStatus } from '../constants';
import { GamesEvent } from '../constants';
import ticketsModel from '../model/tickets';
import gamesModel from '../model/games';
import { writeError } from '../utils/log';

/**
 * Handles ticket notifications by checking if a game is drawn.
 * If drawn returns win/loss status to the client immediately,
 * else listens for GamesEvent.drawn to send status later.
 */
export const notification: Handler = async (req, res) => {
  const { code } = req.params;
  let ticketId: number;
  let gameId: number;

  // Try to fetch the ticket information from the database.
  try {
    const ticket = await ticketsModel.readTicket(code);
    if (!ticket) {
      res.status(400).json({ error: 'The ticket code is wrong' });
      return;
    }
    ticketId = ticket.id;
    gameId = ticket.gameId;
  } catch (err) {
    writeError(JSON.stringify(err));
    return res.status(500).json({ error: 'Database error' });
  }

  const game = await gamesModel.read(gameId);

  if (game?.drawnTicketId) {
    // Current game have been drawn, return result
    if (ticketId === game.drawnTicketId) {
      res.json({ status: TicketStatus.won, gameId });
      return;
    }
    res.json({ status: TicketStatus.lost, gameId });
    return;
  }

  gamesEmitter.once(
    GamesEvent.drawn,
    // Current game have not be drawn, set listener for GamesEvent.drawn, and send status at callback
    (data: TGamePostData) => {
      if (ticketId === data.ticketId) {
        res.json({ status: TicketStatus.won, gameId });
        return;
      }

      res.json({ status: TicketStatus.lost, gameId });
      return;
    }
  );
};

/**
 * Create a new ticket for the next game.
 * It first tries to fetch the next game ID from the database.
 * Then, it attempts to create a ticket up to `maxRetries` times,
 * to account for potential unique code violations.
 *
 * Note: Permissions enhancements are needed. (See TODO)
 */
export const createTicket: Handler = async (req, res) => {
  // TODO check user permissions
  let retries = 0;
  const maxRetries = 10;

  let gameId: number;

  // Attempt to get the next game ID from the gamesModel
  try {
    gameId = await gamesModel.readNextId();
  } catch (err) {
    writeError(JSON.stringify(err));
    res.status(500).json({ msg: 'Database error' });
    return;
  }

  // Loop to try creating a ticket with a unique code
  while (retries < maxRetries) {
    try {
      const { code, createdAt } = await ticketsModel.create(gameId);

      res.json({ gameId, code, createdAt });
      return;
    } catch (err) {
      // Check if the error is a unique violation in PostgreSQL
      if (err instanceof Error && 'code' in err && err.code === PgErrorCodes.UniqueViolation) {
        // Increment retries and try again
        retries++;
        continue;
      }

      writeError(JSON.stringify(err));
      res.status(500).json({ msg: 'Could not create ticket' });
      return;
    }
  }

  // If we reached max retries, respond with an error
  if (retries === maxRetries) {
    res.status(500).json({ msg: 'Could not insert unique code, too munch retries' });
    return;
  }
};
