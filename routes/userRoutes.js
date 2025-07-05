import express from "express";
import { param } from "express-validator";
import { authMiddleware } from "../middleware/auth.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  authMiddleware,
  getUserProfile
);

export default router;