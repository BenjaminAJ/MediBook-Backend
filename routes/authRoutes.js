import express from 'express';
import { registerUser } from '../controllers/userController.js';

const router = express.Router();

// @desc Register a new user 
router.post("/register", registerUser);

export default router;