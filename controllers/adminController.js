import asyncHandler from "express-async-handler"
import User from "../models/User";

export const getAllUsers = asyncHandler(async (req,res)=>{
    const users = await User.find({}, "-password -__v")
        .populate("medicalInfo.allergies", "name")
        .populate("providerInfo.specialization", "name")
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: users,
        message: "Users retrieved successfully"
    });
})