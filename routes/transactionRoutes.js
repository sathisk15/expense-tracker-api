import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import { getTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', authMiddleWare, getTransactions);

export default router;
