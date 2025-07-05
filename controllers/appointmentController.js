import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (patient or admin)
export const createAppointment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { patientId, providerId, dateTime, notes } = req.body;
  const requestingUser = req.user; // From auth middleware

  // Restrict access: Only patients can book for themselves, admins can book for any patient
  if (requestingUser.role !== 'admin' && requestingUser.id.toString() !== patientId) {
    res.status(403);
    throw new Error('Not authorized to create appointment for another patient');
  }

  // Check for appointment conflicts (e.g., provider already booked at this time)
  const conflict = await Appointment.findOne({
    providerId,
    dateTime,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (conflict) {
    res.status(400);
    throw new Error('Provider is already booked at this time');
  }

  // Create appointment
  const appointment = new Appointment({
    patientId,
    providerId,
    dateTime: new Date(dateTime),
    notes,
  });

  await appointment.save();

  // Log action
  await AuditLog.create({
    userId: requestingUser.id,
    action: 'create_appointment',
    details: { appointmentId: appointment._id, patientId, providerId },
  });

  // Populate patient and provider details for response
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email')
    .populate('providerId', 'name providerInfo.specialization');

  res.status(201).json(populatedAppointment);
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (patient, provider, or admin)
export const getAppointment = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const requestingUser = req.user;

  const appointment = await Appointment.findById(appointmentId)
    .populate('patientId', 'name email')
    .populate('providerId', 'name providerInfo.specialization');
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Restrict access: Only patient, provider, or admin can view
  if (
    requestingUser.role !== 'admin' &&
    requestingUser.id.toString() !== appointment.patientId.toString() &&
    requestingUser.id.toString() !== appointment.providerId.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to view this appointment');
  }

  // Log action (only for admin viewing)
  if (requestingUser.role === 'admin') {
    await AuditLog.create({
      userId: requestingUser.id,
      action: 'view_appointment',
      details: { appointmentId, patientId: appointment.patientId },
    });
  }

  res.status(200).json(appointment);
});

// @desc    Update appointment (e.g., change date or status)
// @route   PUT /api/appointments/:id
// @access  Private (patient, provider, or admin)
export const updateAppointment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const appointmentId = req.params.id;
  const requestingUser = req.user;
  const { dateTime, status, notes } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Restrict access: Only patient, provider, or admin can update
  if (
    requestingUser.role !== 'admin' &&
    requestingUser.id.toString() !== appointment.patientId.toString() &&
    requestingUser.id.toString() !== appointment.providerId.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  // Check for conflicts if dateTime is updated
  if (dateTime && dateTime !== appointment.dateTime.toISOString()) {
    const conflict = await Appointment.findOne({
      providerId: appointment.providerId,
      dateTime: new Date(dateTime),
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: appointmentId }, // Exclude current appointment
    });
    if (conflict) {
      res.status(400);
      throw new Error('Provider is already booked at this time');
    }
    appointment.dateTime = new Date(dateTime);
  }

  // Update fields
  appointment.status = status || appointment.status;
  appointment.notes = notes !== undefined ? notes : appointment.notes;

  await appointment.save();

  // Log action
  await AuditLog.create({
    userId: requestingUser.id,
    action: 'update_appointment',
    details: { appointmentId, updatedFields: Object.keys(req.body) },
  });

  // Populate for response
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email')
    .populate('providerId', 'name providerInfo.specialization');

  res.status(200).json(populatedAppointment);
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private (patient, provider, or admin)
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const requestingUser = req.user;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Restrict access: Only patient, provider, or admin can cancel
  if (
    requestingUser.role !== 'admin' &&
    requestingUser.id.toString() !== appointment.patientId.toString() &&
    requestingUser.id.toString() !== appointment.providerId.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to cancel this appointment');
  }

  // Update status to cancelled
  appointment.status = 'cancelled';
  await appointment.save();

  // Log action
  await AuditLog.create({
    userId: requestingUser.id,
    action: 'cancel_appointment',
    details: { appointmentId, patientId: appointment.patientId },
  });

  res.status(200).json({ message: 'Appointment cancelled successfully' });
});

// @desc    Get appointments for a provider
// @route   GET /api/appointments/provider/:providerId
// @access  Private (provider or admin)
export const getProviderAppointments = asyncHandler(async (req, res) => {
  const providerId = req.params.providerId;
  const requestingUser = req.user;

  // Restrict access: Only provider or admin can view
  if (requestingUser.role !== 'admin' && requestingUser.id.toString() !== providerId) {
    res.status(403);
    throw new Error('Not authorized to view this provider’s appointments');
  }

  const appointments = await Appointment.find({ providerId })
    .populate('patientId', 'name email')
    .sort({ dateTime: 1 });

  // Log action (only for admin viewing)
  if (requestingUser.role === 'admin') {
    await AuditLog.create({
      userId: requestingUser.id,
      action: 'view_provider_appointments',
      details: { providerId, count: appointments.length },
    });
  }

  res.status(200).json(appointments);
});

// @desc    Get appointments for a patient
// @route   GET /api/appointments/patient/:patientId
// @access  Private (patient or admin)
export const getPatientAppointments = asyncHandler(async (req, res) => {
  const patientId = req.params.patientId;
  const requestingUser = req.user;

  // Restrict access: Only patient or admin can view
  if (requestingUser.role !== 'admin' && requestingUser.id.toString() !== patientId) {
    res.status(403);
    throw new Error('Not authorized to view this patient’s appointments');
  }

  const appointments = await Appointment.find({ patientId })
    .populate('providerId', 'name providerInfo.specialization')
    .sort({ dateTime: 1 });

  // Log action (only for admin viewing)
  if (requestingUser.role === 'admin') {
    await AuditLog.create({
      userId: requestingUser.id,
      action: 'view_patient_appointments',
      details: { patientId, count: appointments.length },
    });
  }

  res.status(200).json(appointments);
});

