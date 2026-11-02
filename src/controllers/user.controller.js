import UserModel from "../models/user.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find().select("-password").lean();
        res.status(200).json({
            status: "success",
            payload: users,
        });
    } catch (error) {
        next(error);
    }
};