import express from "express";
import { deleteUser, getAllUsers, getAuditLogs } from "../controllers/adminController.js";
import { adminMiddleware } from "../middleware/admin.js";
import { authMiddleware } from "../middleware/auth.js";
import { body, param } from "express-validator";

// Validation rules
const auditLogValidation = [
  body("userId").optional().isMongoId().withMessage("Invalid user ID"),
  body("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid start date"),
  body("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date"),
  body("action")
    .optional()
    .isIn([
      "login",
      "logout",
      "register_user",
      "update_user",
      "delete_user",
      "create_appointment",
      "update_appointment",
      "cancel_appointment",
      "view_patient_data",
      "view_all_users",
      "view_audit_logs",
      "update_user_role",
      "update_system_config",
    ])
    .withMessage("Invalid action"),
];

const roleValidation = [
  body("role")
    .isIn(["patient", "provider", "admin"])
    .withMessage("Invalid role"),
];

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

router.get("/audit-logs", authMiddleware, adminMiddleware, auditLogValidation, getAuditLogs);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isMongoId().withMessage("Invalid user ID")],
  deleteUser
);

export default router;
