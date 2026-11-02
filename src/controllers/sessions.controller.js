import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => { 
  
  res.status(201).json({
    status: "success",
    message: "Usuario registrado"
    });
  };

export const login = async (req, res) => {
  res.cookie("currentUser", req.user.generateToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  res.status(200).json({
    status: "success",
    payload: req.user,
  });
};

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
  
