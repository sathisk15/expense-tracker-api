import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import {
  addFunds,
  createAccount,
  getAccounts,
} from '../controllers/accountController.js';

const router = express.Router();

router.get('/', authMiddleWare, getAccounts);
router.post('/create-account', authMiddleWare, createAccount);
router.post('/add-funds/:id', authMiddleWare, addFunds);

export default router;
