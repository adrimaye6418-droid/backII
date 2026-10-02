import usersRepository from "../repositories/users.repository.js";
import { hashPassword } from "../utils/hash.js";

class SessionsService {
    async register(userData) {
        const {
            first_name,
            last_name,
            email,
            password,
        } = userData;

        if (
            !first_name || 
            !last_name || 
            !email || 
            !password
        ) {
            throw new Error("Faltan campos obligatorios");
        }

        const normalizedEmail = email.trim().toLowerCase();

        const emailRegex = 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            throw new Error("Formato de correo electrónico inválido");
        }

        if (password.length < 6) {
            throw new Error(
                "La contraseña debe tener al menos 6 caracteres");
        }

        const existingUser = 
        await usersRepository.getByEmail(normalizedEmail);

        if (existingUser) {
            const error = new Error("El correo electrónico ya está registrado");
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = 
            await usersRepository.create({
            first_name,
            last_name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "user",
        });

        return {
            id: newUser._id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            role: newUser.role,
            };
        }   
    }

export default new SessionsService();