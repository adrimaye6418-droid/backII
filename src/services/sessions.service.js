import bcrypt from "bcrypt";

import usersRepository from "../repositories/users.repository.js";
import UserDTO from "../dto/user.dto.js";
import { AppError } from "../utils/AppError.js";

class SessionsService {
  normalizeEmail(email) {
    const normalizedEmail = String(
      email || ""
    )
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      throw new AppError(
        "El correo electrónico es obligatorio",
        400
      );
    }

    return normalizedEmail;
  }

  validatePassword(password) {
    if (
      typeof password !== "string" ||
      password.trim() === ""
    ) {
      throw new AppError(
        "La contraseña es obligatoria",
        400
      );
    }
  }

  validateRegisterData(data) {
    const firstName = String(
      data?.first_name || ""
    ).trim();

    const lastName = String(
      data?.last_name || ""
    ).trim();

    if (!firstName) {
      throw new AppError(
        "El nombre es obligatorio",
        400
      );
    }

    if (!lastName) {
      throw new AppError(
        "El apellido es obligatorio",
        400
      );
    }

    this.normalizeEmail(data?.email);
    this.validatePassword(data?.password);

    return {
      firstName,
      lastName,
    };
  }

  async register(data) {
    const {
      firstName,
      lastName,
    } = this.validateRegisterData(data);

    const normalizedEmail =
      this.normalizeEmail(data.email);

    const emailAlreadyExists =
      await usersRepository.emailExists(
        normalizedEmail
      );

    if (emailAlreadyExists) {
      throw new AppError(
        "El correo electrónico ya está en uso",
        409
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        10
      );

    let user;

    try {
      user =
        await usersRepository
          .createWithDocument({
            first_name: firstName,
            last_name: lastName,
            email: normalizedEmail,
            password: hashedPassword,
            role: "user",
          });
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError(
          "El correo electrónico ya está en uso",
          409
        );
      }

      throw error;
    }

    return {
      userDocument: user,
      user: UserDTO.from(user),
    };
  }

  async login(email, password) {
    const normalizedEmail =
      this.normalizeEmail(email);

    this.validatePassword(password);

    const user =
      await usersRepository
        .findCredentialsByEmail(
          normalizedEmail
        );

    if (!user) {
      throw new AppError(
        "Credenciales inválidas",
        401
      );
    }

    if (!user.password ||
    typeof user.password !== "string"
  ) {
    throw new AppError(
      "El usuario no tiene una contraseña válida registrada",
      401
    );
  }

    const isValidPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isValidPassword) {
      throw new AppError(
        "Credenciales inválidas",
        401
      );
    }

    return user;
  }

  async getCurrentUser(userId) {
    if (!userId) {
      throw new AppError(
        "No autenticado",
        401
      );
    }

    const user =
      await usersRepository.findById(
        userId
      );

    if (!user) {
      throw new AppError(
        "Usuario no encontrado",
        404
      );
    }

    return user;
  }

  toDTO(user) {
    return UserDTO.from(user);
  }
}

export default new SessionsService();