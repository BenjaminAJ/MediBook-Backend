import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

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
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Log login action
  await AuditLog.create({
    userId: user._id,
    action: "login",
    details: { email },
  });

  // Generate JWT
  const token = generateToken(user._id, user.role);

  res.status(200).json({
    _id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
    token,
  });
});

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private (user or admin)
export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const requestingUser = req.user; // From auth middleware

  // Restrict access: Users can only view their own profile, admins can view any
  if (
    requestingUser.id.toString() !== userId &&
    requestingUser.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this profile");
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Log profile view (only for admin accessing another user’s data)
  if (
    requestingUser.role === "admin" &&
    requestingUser.id.toString() !== userId
  ) {
    await AuditLog.create({
      userId: requestingUser.id,
      action: "view_patient_data",
      details: { viewedUserId: userId, viewedRole: user.role },
    });
  }

  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (user or admin)
export const updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.params.id;
  const requestingUser = req.user; // From auth middleware

  // Restrict access: Users can only update their own profile, admins can update any
  if (
    requestingUser.id.toString() !== userId &&
    requestingUser.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this profile");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update allowed fields
  const { name, phone, address, medicalInfo, providerInfo } = req.body;
  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  if (user.role === "patient") {
    user.medicalInfo = medicalInfo || user.medicalInfo;
  }
  if (user.role === "provider") {
    user.providerInfo = providerInfo || user.providerInfo;
  }

  await user.save();

  // Log update action
  await AuditLog.create({
    userId: requestingUser.id,
    action: "update_user",
    details: { updatedUserId: userId, updatedFields: Object.keys(req.body) },
  });

  res.status(200).json({
    _id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
});

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
};
