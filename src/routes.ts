import express from 'express';
import morgan from 'morgan';

// Controllers
import AuthController from './controllers/auth.controller';
import MeController from './controllers/me.controller';
import InviteController from './controllers/invite.controller';

// Routers
import { CreateAuthenticatedRouter } from './middleware/auth.middleware';

// Authenticated API Controller
const ApiController = CreateAuthenticatedRouter();
ApiController.use('/me', MeController);
ApiController.use('/invites', InviteController);

const app = express();

// Middleware
app.use(morgan('combined'));

app.use('/auth', AuthController);
app.use('/api', ApiController);

export default app;
