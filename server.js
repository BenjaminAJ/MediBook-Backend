import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middleware/errorHandler.js";

// Load environment variables from .env file
dotenv.config();

// Importing routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

const app = express();

// Load Swagger documentation
const swaggerDocument = YAML.load( 'docs/swagger.yaml');


// Enable CORS for all origins
app.use(cors({ origins: "*", credentials: true }));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Error handling middleware
app.use(errorHandler);

// Setting up the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
