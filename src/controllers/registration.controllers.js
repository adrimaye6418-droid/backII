import userSchema from "../models/user.js";

export const createRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const registration = await userSchema.create({
      event: eventId,
      user: req.user._id,
    });

    return res.status(201).json({
      status: "success",
      payload: registration,
    });
  } catch (error) {
    next(error);
  }
};