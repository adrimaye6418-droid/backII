import { verifyToken } from "../utils/jwt.js";
import passport from "passport";

export const authenticate = (req, res, next) => {
  passport.authenticate(
    "current", 
    { session: false }, 
    (error, user) => {
    
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado"
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const auth = (req, res, next) => {
  try {
    const token = req.cookies.currentUser;

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado"
      });
    }

    const user = verifyToken(token);

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado"
    });
  }
};