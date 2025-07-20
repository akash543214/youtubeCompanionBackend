// src/app.ts
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './lib/prisma'; // <- Ensure this runs at app startup
import errorHandler from './middlewares/errorHandler';
import userRouter from './routes/users.routes';
import './config/passport';

import ApiError from './utils/apiError';
import passport from 'passport';

require('dotenv').config();

const app = express();

app.set('trust proxy', 1);
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());  

app.use(passport.initialize());

// Routes
app.use("/api", userRouter);
import youtubeRoutes from './routes/youtube.routes';
app.use('/api/youtube', youtubeRoutes);
// 404 handler
app.use((req, _, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
