import mongoose from "mongoose";
import crypto from "crypto";

import eventsRepository from "../repositories/events.repository.js";
import ticketsRepository from "../repositories/tickets.repository.js";
import mailService from "./mail.service.js";
import { AppError } from "../utils/AppError.js";

class TicketsService {
  validateObjectId(id, entityName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(`ID de ${entityName} inválido`, 400);
    }
  }

  getUserId(user) {
    const userId = user?._id || user?.id;

    if (!userId) {
      throw new AppError("No autenticado", 401);
    }

    return userId;
  }

  validateQuantity(quantity) {
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      throw new AppError(
        "La cantidad debe ser un número entero mayor que cero",
        400
      );
    }

    return parsedQuantity;
  }

  validateEventForRegistration(event) {
    if (event.status !== "published") {
      throw new AppError(
        "El evento no está disponible para inscripciones",
        400
      );
    }

    if (
      event.status === "cancelled" ||
      event.status === "finalized"
    ) {
      throw new AppError(
        "No es posible inscribirse en un evento cancelado o finalizado",
        400
      );
    }

    if (new Date(event.date) <= new Date()) {
      throw new AppError(
        "No es posible inscribirse en un evento que ya finalizó",
        400
      );
    }
  }

  generateReservationCode() {
    return `TKT-${crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 12)
      .toUpperCase()}`;
  }

  async createTicket(eventId, data, user) {
    this.validateObjectId(eventId, "evento");

    const userId = this.getUserId(user);
    const quantity = this.validateQuantity(data?.quantity);

    const event = await eventsRepository.findByIdWithoutPopulate(eventId);

        if (!event) {
        throw new AppError("Evento no encontrado", 404);
        }

    this.validateEventForRegistration(event);

    const existingTicket =
      await ticketsRepository.findActiveByUserAndEvent(
        userId,
        event._id
      );

    if (existingTicket) {
      throw new AppError(
        "Ya tenés una inscripción activa para este evento",
        409
      );
    }

    const reservedQuantity =
      await ticketsRepository.getReservedQuantity(
        new mongoose.Types.ObjectId(event._id)
      );

    const availableCapacity =
      event.capacity - reservedQuantity;

    if (availableCapacity < quantity) {
      throw new AppError(`No hay cupos suficientes. Cupos disponibles: ${availableCapacity}`,
             409
            );
    }

    const reservationCode =
      this.generateReservationCode();

    let ticket;

    try {
      ticket = await ticketsRepository.create({
        user: userId,
        event: event._id,
        status: "confirmed",
        quantity,
        reservationCode,
        cancelledAt: null,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError(
          "Ya tenés una inscripción activa para este evento",
          409
        );
      }

      throw error;
    }

    let emailSent = true;

    try {
      await mailService.sendTicketConfirmation({
        to: user.email,
        userName:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "usuario",
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        quantity: ticket.quantity,
        reservationCode: ticket.reservationCode,
      });
    } catch (error) {
      emailSent = false;

      console.error(
        "El ticket fue creado, pero no se pudo enviar el email:",
        error.message
      );
    }

    const createdTicket =
      await ticketsRepository.findByIdWithDetails(ticket._id);

    return {
      ticket: createdTicket,
      emailSent,
    };
  }

  async getMyTickets(user) {
    const userId = this.getUserId(user);

    return ticketsRepository.findByUser(userId);
  }

  async getEventTickets(eventId, user) {
    this.validateObjectId(eventId, "evento");

    const userId = this.getUserId(user);

    const event =
      await eventsRepository.findByIdWithoutPopulate(eventId);

    if (!event) {
      throw new AppError("Evento no encontrado", 404);
    }

    const isAdmin = user.role === "admin";

    const isOrganizer =
      user.role === "organizer" &&
      event.organizer.toString() === userId.toString();

    if (!isAdmin && !isOrganizer) {
      throw new AppError("No tenés permisos para consultar los tickets de este evento",
        403
      );
    }

    return ticketsRepository.findByEvent(event._id);
  }

  async cancelTicket(ticketId, user) {
    this.validateObjectId(ticketId, "ticket");

    const userId = this.getUserId(user);

    const ticket = await ticketsRepository.findById(ticketId);

    if (!ticket) {
      throw new AppError("Ticket no encontrado", 404);
    }

    const isAdmin = user.role === "admin";

    const isOwner =
      ticket.user.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      throw new AppError(
        "No tenés permisos para cancelar este ticket",
        403
      );
    }

    if (ticket.status === "cancelled") {
      throw new AppError(
        "El ticket ya se encuentra cancelado",
        409
      );
    }

    ticket.status = "cancelled";
    ticket.cancelledAt = new Date();

    await ticketsRepository.save(ticket);

    return ticketsRepository.findByIdWithDetails(ticket._id);
  }
}

export default new TicketsService();