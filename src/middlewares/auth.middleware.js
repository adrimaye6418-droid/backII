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
