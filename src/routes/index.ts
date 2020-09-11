import express from 'express';
import morgan from 'morgan';

// Subrouters
import api from './api';
import auth from './auth';

const app = express();

app.use(morgan('combined'));

app.use('/auth', auth);
app.use('/api', api);

export default app;
