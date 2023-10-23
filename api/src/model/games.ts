import db from '../utils/db';

const create = async () => {
  return (await db.query<{ id: number }>('INSERT INTO games DEFAULT VALUES RETURNING id')).rows[0];
};

/**
 * Fetch the corresponding game information using the gameId.
 */
const read = async (id: number) => {
  const result = await db.query<{ drawn_ticket_id: number | null }>('SELECT drawn_ticket_id FROM games WHERE id = $1', [
    id,
  ]);

  if (result.rows.length > 0) {
    const { drawn_ticket_id: drawnTicketId } = result.rows[0];
    return { drawnTicketId };
  }
  return null;
};

/**
 * Reads the last game ID from the games table and returns it.
 * If the table is empty, it returns 0.
 */
const readLastId = async () => {
  return (await db.query<{ max: number }>('SELECT MAX(id) FROM games')).rows[0].max || 0;
};

/**
 * Reads the next available game ID
 */
const readNextId = async () => {
  const lastId = (await gamesModel.readLastId()) || 0;
  return lastId + 1;
};

/**
 * Updates the drawn_ticket_id for a given game
 *
 * @throws Error - If the game could not be updated
 */
const update = async (gameId: number, ticketId: number) => {
  const result = await db.query<{ updated_at: Date }>(
    'UPDATE games SET drawn_ticket_id = $1 WHERE id = $2 RETURNING updated_at',
    [ticketId, gameId]
  );

  if (result.rows.length > 0) {
    const { updated_at: updatedAt } = result.rows[0];
    return { updatedAt };
  }

  throw new Error('Could not update game');
};

const gamesModel = {
  create,
  read,
  readLastId,
  readNextId,
  update,
};
export default gamesModel;
