import express from "express";
import { getAllUsers } from "../controllers/adminController.js";
import { adminMiddleware } from "../middleware/admin.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware ,getAllUsers);

export default router;