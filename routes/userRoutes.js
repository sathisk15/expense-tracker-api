import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import { getUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authMiddleWare, getUser);

export default router;
