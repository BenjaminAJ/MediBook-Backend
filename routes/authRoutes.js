import express from 'express';
import { loginUser, registerUser } from '../controllers/userController.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('role').isIn(['patient', 'provider', 'admin']).withMessage('Invalid role'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
];

// @desc Register a new user 
router.post("/register", registerValidation,registerUser);

// @desc Login a user
router.post("/login", loginUser);

export default router;