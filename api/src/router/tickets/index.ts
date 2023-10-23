import { Router } from 'express';
import { createTicket, notification } from '../../handler/ticket';
import headerMiddleware from '../../middleware/header';

const ticketsRouter = Router();

ticketsRouter.get('/:code/notification', headerMiddleware.sse, notification);
ticketsRouter.post('', createTicket);

export default ticketsRouter;
