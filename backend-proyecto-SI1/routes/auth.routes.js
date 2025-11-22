import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/permission.middleware.js';

const router = express.Router();

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// POST /api/auth/register - Registrar usuario
router.post('/register', authController.register);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authenticate, authController.logout);

export default router;
