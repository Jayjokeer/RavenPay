import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index';
import globalErrorHandler from './errors/error-handler';
import AppError from './errors/error';

dotenv.config();
require('./db');

const app = express();
app.use(express.json());

app.use('/api/v1', routes);

app.use(globalErrorHandler); 
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

export default app;