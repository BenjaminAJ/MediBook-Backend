import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { validationResult } from "express-validator";

// @desc    List all users (admin only)
// @route   GET /api/admin/users
// @access  Private (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "-password -__v").sort({ createdAt: -1 });

  // Log the action
  await AuditLog.create({
    userId: req.user.id,
    action: "view_all_users",
    details: { count: users.length },
  });

  res.status(200).json({
    success: true,
    data: users,
    message: "Users retrieved successfully",
  });
});

// @desc    Delete a user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  // Ensure only admins can access
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized: Admin access required");
  }
  const userId = req.params.id; 

  // Prevent admins from deleting themselves
  if (req.user.id.toString() === userId) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  // Find and delete user
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    action: 'delete_user',
    details: { deletedUserId: userId, deletedEmail: user.email, deletedRole: user.role },
  });

  res.status(200).json({ message: 'User deleted successfully' });
});

// @desc    Retrieve audit logs (admin only)
// @route   POST /api/admin/audit-logs
// @access  Private (admin only)
export const getAuditLogs = asyncHandler(async (req, res) => {
  // Ensure only admins can access
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized: Admin access required');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, startDate, endDate, action } = req.body;

  // Build query
  const query = {};
  if (userId) query.userId = userId;
  if (startDate && endDate) {
    query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (action) query.action = action;

  // Fetch audit logs
  const logs = await AuditLog.find(query).populate('userId', 'name email role');

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    action: 'view_audit_logs',
    details: { query, count: logs.length },
  });

  res.status(200).json(logs);
});

// @desc    Update user role (admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin only)
export const updateUserRole = asyncHandler(async (req, res) => {
  // Ensure only admins can access
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized: Admin access required');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.params.id;
  const { role } = req.body;

  // Prevent admins from modifying their own role
  if (req.user._id.toString() === userId) {
    res.status(400);
    throw new Error('Cannot modify your own role');
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update role
  user.role = role;
  await user.save();

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    action: 'update_user_role',
    details: { updatedUserId: userId, oldRole: user.role, newRole: role },
  });

  res.status(200).json({
    _id: user._id,
    email: user.email,
    role: user.role,
  });
});