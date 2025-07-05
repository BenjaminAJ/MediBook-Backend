import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"


export const authMiddleware = asyncHandler(async (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
})