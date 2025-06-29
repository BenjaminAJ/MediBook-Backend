import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import jwt from "jsonwebtoken";

// @desc    Register a new user (patient, provider, or admin)
// @route   POST /api/auth/register
// @access  Public (admin may restrict provider/admin registration)
export const registerUser = asyncHandler(async (req, res) => {
  const {
    role,
    email,
    password,
    name,
    phone,
    address,
    medicalInfo,
    providerInfo,
  } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Create new user
  const user = new User({
    role,
    email,
    password,
    name,
    phone,
    address,
    medicalInfo: role === "patient" ? medicalInfo : undefined,
    providerInfo: role === "provider" ? providerInfo : undefined,
  });

  // Save user
  await user.save();

  // Log registration action
  await AuditLog.create({
    userId: user._id,
    action: "register_user",
    details: { role, email },
  });

  // Generate JWT
  const token = generateToken(user._id, user.role);

  res.status(201).json({
    _id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
    token,
  });
});

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour
  });
};