import db from '../utils/db';
import { v4 as uuid } from 'uuid';

/**
 * Creates a new ticket with a unique code for a given game ID
 */
const create = async (gameId: number) => {
  const row = (
    await db.query<{ code: string; created_at: Date }>(
      'INSERT INTO tickets (code, game_id) VALUES ($1, $2) RETURNING code, created_at',
      [uuid().replace(/-/g, ''), gameId]
    )
  ).rows[0];

  return { code: row.code, createdAt: row.created_at };
};

/**
 * Reads all tickets for a given game ID
 */
const readTickets = async (gameId: number) => {
  return await db.query<{ id: number; code: string }>('SELECT id, code FROM tickets WHERE game_id = $1', [gameId]);
};

/**
 * Reads a single ticket based on its code
 */
const readTicket = async (code: string) => {
  const result = await db.query<{ id: number; game_id: number }>('SELECT id, game_id FROM tickets WHERE code = $1', [
    code,
  ]);

  if (result.rows.length > 0) {
    const { id, game_id: gameId } = result.rows[0];
    return { id, gameId };
  }
  return null;
};

const ticketsModel = {
  create,
  readTickets,
  readTicket,
};
export default ticketsModel;
