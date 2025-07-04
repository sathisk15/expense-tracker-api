import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import { getAccounts } from '../controllers/accountController.js';

const router = express.Router();

router.get('/', authMiddleWare, getAccounts);

export default router;
