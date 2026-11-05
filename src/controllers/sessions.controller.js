import { generateToken } from "../utils/jwt.js";


export const register = async (req, res) => { 
  
  res.status(201).json({
    status: "success",
    message: "Usuario registrado"
    });
  };

export const login = async (req, res) => {
  try {
    const token = generateToken(req.user);
    res.cookie("currentUser", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60*60*1000, // 1 hora
  });
  return res.status(200).json({
    status: "success",
    message: "Login correcto",
    });
  }
  catch (error) {
    return next (error);
  }
  
}

export const current = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Usuario autenticado",
    payload: { user: req.user,
              email: req.user.email,
              role: req.user.role,
    }
  });
}
  
export const logout = async (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  res.status(200).json({
    status: "success",
    message: "Logout correcto"
  });
};
  
