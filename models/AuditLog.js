import mongoose from "mongoose";
import mongooseEncryption from "mongoose-encryption";

const auditLogSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  action: {
    type: String,
    required: [true, "Action is required"],
    enum: [
      "login",
      "logout",
      "register_user",
      "update_user",
      "delete_user",
      "create_appointment",
      "update_appointment",
      "cancel_appointment",
      "view_patient_data",
      "view_all_users",
      "view_audit_logs",
      "update_user_role",
      "update_system_config",
    ],
    trim: true,
  },
  details: {
    type: Object, // Changed to Object to allow storing JSON-like data
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: [true, "Timestamp is required"],
  },
});

// Sensitive Fields to Encrypt
const encryptFields = ["details"];

//Middleware: Ensure timestamp is set
auditLogSchema.pre('save', function (next) {
  this.timestamp = this.timestamp || Date.now();
  next();
});

// Create indexes for performance
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ timestamp: 1 });
auditLogSchema.index({ action: 1, timestamp: 1 });


// Encrypt sensitive fields using mongoose-encryption
auditLogSchema.plugin(mongooseEncryption, {
  encryptionKey: process.env.ENCRYPTION_KEY,
  signingKey: process.env.SIGNING_KEY,
  encryptedFields: encryptFields,
});

export default mongoose.model("AuditLog", auditLogSchema);
