import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import {
  addTransaction,
  getDashboardInformation,
  getTransactions,
  transerMoneyToAccount,
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', authMiddleWare, getTransactions);
router.post('/', authMiddleWare, transerMoneyToAccount);
router.get('/dashboardInfo', authMiddleWare, getDashboardInformation);
router.post('/addTransaction', authMiddleWare, addTransaction);

export default router;
