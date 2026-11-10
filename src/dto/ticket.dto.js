import UserDTO from "./user.dto.js";
import EventDTO from "./event.dto.js";

class TicketDTO {
  constructor(ticket) {
    const data = TicketDTO.toPlainObject(
      ticket
    );

    this.id = data._id?.toString() || data.id;

    this.user = TicketDTO.mapUser(
      data.user
    );

    this.event = TicketDTO.mapEvent(
      data.event
    );

    this.status = data.status;
    this.quantity = data.quantity;
    this.reservationCode =
      data.reservationCode;
    this.createdAt = data.createdAt;
    this.cancelledAt =
      data.cancelledAt || null;

    if (data.updatedAt) {
      this.updatedAt = data.updatedAt;
    }
  }

  static toPlainObject(ticket) {
    if (!ticket) {
      return {};
    }

    if (
      typeof ticket.toObject === "function"
    ) {
      return ticket.toObject();
    }

    return ticket;
  }

  static mapUser(user) {
    if (!user) {
      return null;
    }

    const isPopulated =
      typeof user === "object" &&
      (
        user.first_name !== undefined ||
        user.email !== undefined ||
        user.role !== undefined
      );

      if (isPopulated) {
        return UserDTO.from(user);
      }
    

    return user.toString();
  }

  static mapEvent(event) {
    if (!event) {
      return null;
    }

    const isPopulated =
    typeof event === "object" &&
    (
      event.title !== undefined ||
      event.date !== undefined ||
      event.location !== undefined
    );

        if (isPopulated) {
            return EventDTO.from(event);
        }

    return event.toString();
  }

  static from(ticket) {
    if (!ticket) {
      return null;
    }

    return new TicketDTO(ticket);
  }

  static fromList(tickets = []) {
    return tickets.map(
      (ticket) => new TicketDTO(ticket)
    );
  }
}

export default TicketDTO;