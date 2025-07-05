import express from "express";
import { deleteUser, getAllUsers } from "../controllers/adminController.js";
import { adminMiddleware } from "../middleware/admin.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware ,getAllUsers);

router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;