import express from 'express';
import { registerUser } from '../controllers/userController.js';
import { loginUser } from '../controllers/authController.js';

const router = express.Router();

// @desc Register a new user 
router.post("/register", registerUser);

// @desc Login a user
router.post("/login", loginUser);

export default router;