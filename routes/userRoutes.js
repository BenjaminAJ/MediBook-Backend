import express from "express";
import { body, param } from "express-validator";
import { authMiddleware } from "../middleware/auth.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

const updateValidation = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("phone")
    .optional()
    .matches(/^(?:\+234|234|0)[789][01]\d{8}$/)
    .withMessage("Invalid Nigerian phone number"),
  body("address")
    .optional()
    .isObject()
    .withMessage("Address must be an object"),
  body("medicalInfo")
    .optional()
    .custom((value, { req }) => {
      if (req.body.role === "patient" && value === null) {
        throw new Error("Medical info cannot be null for patients");
      }
      return true;
    }),
  body("providerInfo")
    .optional()
    .custom((value, { req }) => {
      if (req.body.role === "provider" && value === null) {
        throw new Error("Provider info cannot be null for providers");
      }
      return true;
    }),
];

router.get(
  "/profile", // Endpoint for authenticated user to view their own profile
  authMiddleware,
  getUserProfile
);

router.get(
  "/:id", // Endpoint for admin to view any user's profile by ID
  [param("id").isMongoId().withMessage("Invalid user ID")],
  authMiddleware,
  getUserProfile
);

router.put(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID"), ...updateValidation],
  authMiddleware,
  updateUserProfile
);
export default router;
