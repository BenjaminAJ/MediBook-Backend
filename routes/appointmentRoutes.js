import express from "express";
import { body, param } from "express-validator";
import { authMiddleware } from "../middleware/auth.js";
import {
    cancelAppointment,
  createAppointment,
  getAppointment,
  getPatientAppointments,
  getProviderAppointments,
  updateAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

// Validation rules
const createAppointmentValidation = [
  body("patientId").isMongoId().withMessage("Invalid patient ID"),
  body("providerId").isMongoId().withMessage("Invalid provider ID"),
  body("dateTime").isISO8601().toDate().withMessage("Invalid date and time"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];

const updateAppointmentValidation = [
  body("dateTime")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid date and time"),
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage("Invalid status"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];

// Routes
router.post(
  "/",
  authMiddleware,
  createAppointmentValidation,
  createAppointment
);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid appointment ID")],
  authMiddleware,
  getAppointment
);
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid appointment ID"),
    ...updateAppointmentValidation,
  ],
  authMiddleware,
  updateAppointment
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid appointment ID")],
  authMiddleware,
  cancelAppointment
);
router.get(
  "/provider/:providerId",
  [param("providerId").isMongoId().withMessage("Invalid provider ID")],
  authMiddleware,
  getProviderAppointments
);
router.get(
  "/patient/:patientId",
  [param("patientId").isMongoId().withMessage("Invalid patient ID")],
  authMiddleware,
  getPatientAppointments
);

module.exports = router;
