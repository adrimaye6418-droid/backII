import passport from "passport";

export const authenticate = (req, res, next) => {
  passport.authenticate(
    "current", 
    { session: false }, 
    (error, user, info) => {
      if (error) {
        return next(error);
      }
    
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: info?.message || "No autenticado",
      });
    }
      req.user = user;
      return next();
    })(req, res, next);

};
