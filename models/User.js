import mongoose from "mongoose";
import mongooseEncryption from "mongoose-encryption";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^(?:\+234|234|0)[789][01]\d{8}$/,
        "Please enter a valid Nigerian phone number",
      ],
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    role: {
      type: String,
      enum: ["patient", "provider", "admin"],
      required: [true, "Role is required"],
      default: "patient",
    },
    medicalInfo: {
      // Patient-specific fields (optional, only for role: 'patient')
      dateOfBirth: { type: Date },
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      allergies: [{ type: String, trim: true }],
      medicalHistory: [{ type: String, trim: true }],
    },
    providerInfo: {
      // Provider-specific fields (optional, only for role: 'provider')
      specialization: { type: String, trim: true },
      clinicName: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

//Sensitive Fields to Encrypt
const encryptFields = ["name", "phone", "address", "medicalInfo"];

//HashPassword Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

//Method to Compare Passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

//Encrypt Sensitive Fields
userSchema.plugin(mongooseEncryption, {
  enccryptionKey: process.env.ENCRYPTION_KEY,
  signingKey: process.env.SIGNING_KEY,
  encryptedFields: encryptFields,
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
