import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

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
