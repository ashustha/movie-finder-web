import express from 'express';
import { register } from '../controllers/authController';

export const authRouter = express.Router();

// POST /api/auth/login
authRouter.post('/login', login);

// POST /api/auth/register
authRouter.post('/register', register);
