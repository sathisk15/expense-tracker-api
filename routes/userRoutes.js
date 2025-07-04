import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import {
  getUser,
  updateUserPassword,
  updateUserinfo,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', authMiddleWare, getUser);
router.put('/', authMiddleWare, updateUserinfo);
router.put('/update-password', authMiddleWare, updateUserPassword);

export default router;
