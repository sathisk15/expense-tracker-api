import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import {
  getTransactions,
  transerMoneyToAccount,
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', authMiddleWare, getTransactions);
router.post('/', authMiddleWare, transerMoneyToAccount);

export default router;
