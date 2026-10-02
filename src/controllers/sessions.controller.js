import sessionsService from "../services/sessions.service.js";

export const register = async (req, res) => { 
  try {
    const user = await sessionsService.register(req.body);
    res.status(201).json({
      status: "success",
      message: "Usuario registrado con exito",
      payload: user
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      status: "error",
      message: error.message,
    });
  }
};

