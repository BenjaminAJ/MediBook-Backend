import mongoose from "mongoose";
import mongooseEncryption from "mongoose-encryption";

const appointmentSchema = mongoose.Schema({
    patientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: [true, "Patient ID is required"]
    },
    providerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: [true, "Provider ID is required"]
    },
    dateTime: {
        type: Date,
        required: [true, "Appointment date and time is required"]
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: "pending",
        required: [true, "Appointment status is required"]
    },
    notes: {
        type: String,
        trim:true,
        default: ""
    }
}, {timestamps: true});

//Sensitive Fields to Encrypt
const encryptFields = ["notes"];

appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ providerId: 1 });
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ patientId: 1, providerId: 1, dateTime: 1 });


//Encyrpt Sensitive Fields
appointmentSchema.plugin(mongooseEncryption, {
    encryptionKey: process.env.ENCRYPTION_KEY,
    signingKey: process.env.SIGNING_KEY,
    encryptedFields: encryptFields,
});

export default mongoose.model("Appointment", appointmentSchema);