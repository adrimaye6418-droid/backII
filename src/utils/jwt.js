import jwt from "jsonwebtoken";

export const login = (req, res) => {

  const token = jwt.sign(
    {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );

  res.cookie("currentUser", token, {
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Login correcto",
  })
};


export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};