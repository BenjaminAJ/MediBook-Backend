import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler";

const app = express();

dotenv.config();


// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use(errorHandler);

// Setting up the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})

