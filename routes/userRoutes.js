import express from 'express';
import { authMiddleWare } from '../middlewares/authMiddleWare.js';
import {
  getUser,
  updateUserPassword,
  updateUserinfo,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', authMiddleWare, getUser);
router.put('/update-password', authMiddleWare, updateUserPassword);
router.put('/update-user-info', authMiddleWare, updateUserinfo);

export default router;
