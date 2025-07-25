import express from 'express';
import dotenv from 'dotenv';
import routes from '../src/routes/index';
import globalErrorHandler from './errors/error-handler';
import AppError from './errors/error';
const PORT = process.env.PORT || 3002;
dotenv.config();
require('../src/db');
const app = express();
app.use(express.json());

app.use('/api/v1', routes);
app.use(globalErrorHandler); 
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404)); 
  });
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));