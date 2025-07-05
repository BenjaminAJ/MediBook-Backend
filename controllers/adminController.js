import asyncHandler from "express-async-handler";
import User from "../models/User";
import AuditLog from "../models/AuditLog";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "-password -__v").sort({ createdAt: -1 });

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    action: "view_all_users",
    details: { count: users.length },
  });

  res.status(200).json({
    success: true,
    data: users,
    message: "Users retrieved successfully",
  });
});
