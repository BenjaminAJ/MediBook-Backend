import express from "express";
import {body} from "express-validator"
import { getAuditLogs } from "../controllers/auditLogController.js";
import {authMiddleware} from "../middleware/auth.js";
import {adminMiddleware} from "../middleware/admin.js";

const router = express.Router();

// Validation rules
const auditLogValidation = [
  body('userId').optional().isMongoId().withMessage('Invalid user ID'),
  body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date'),
  body('action')
    .optional()
    .isIn([
      'login',
      'logout',
      'register_user',
      'update_user',
      'delete_user',
      'create_appointment',
      'update_appointment',
      'cancel_appointment',
      'view_patient_data',
      'view_all_users',
      'view_audit_logs',
      'update_user_role',
      'view_provider_appointments',
      'view_patient_appointments',
      'update_system_config',
    ])
    .withMessage('Invalid action'),
];

// Routes
router.post('/', authMiddleware, adminMiddleware,auditLogValidation, getAuditLogs);

export default router;