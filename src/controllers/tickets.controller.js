import ticketsService from "../services/tickets.service.js";

export const createTicket = async (req, res, next) => {
  try {
    const result = await ticketsService.createTicket(
      req.params.eid,
      req.body,
      req.user
    );

    return res.status(201).json({
      status: "success",
      message: result.emailSent
        ? "Inscripción confirmada y email enviado"
        : "Inscripción confirmada, pero no se pudo enviar el email",
      payload: result.ticket,
      emailSent: result.emailSent,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.getMyTickets(
      req.user
    );

    return res.status(200).json({
      status: "success",
      payload: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (
  req,
  res,
  next
) => {
  try {
    const tickets =
      await ticketsService.getEventTickets(
        req.params.eid,
        req.user
      );

    return res.status(200).json({
      status: "success",
      payload: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (
  req,
  res,
  next
) => {
  try {
    const ticket =
      await ticketsService.cancelTicket(
        req.params.tid,
        req.user
      );

    return res.status(200).json({
      status: "success",
      message: "Ticket cancelado correctamente",
      payload: ticket,
    });
  } catch (error) {
    next(error);
  }
};