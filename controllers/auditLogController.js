import AuditLog from "../models/AuditLog.js";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

// @desc    Retrieve audit logs (admin only)
// @route   POST /api/audit-logs
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

  // Fetch audit logs with populated user details
  const logs = await AuditLog.find(query)
    .populate('userId', 'name email role')
    .sort({ timestamp: -1 }); // Sort by newest first

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    action: 'view_audit_logs',
    details: { query, count: logs.length },
  });

  res.status(200).json(logs);
});
