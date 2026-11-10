import TicketDAO from "../dao/ticket.dao.js";

class TicketsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(data) {
    return this.dao.create(data);
  }

  async findById(id) {
    return this.dao.findById(id);
  }

  async findByIdWithDetails(id) {
    return this.dao.findById(id, {
      populate: [
        {
          path: "user",
          select:
            "first_name last_name email role",
        },
        {
          path: "event",
          select:
            "title date location capacity status organizer",
        },
      ],
    });
  }

  async findActiveByUserAndEvent(
    userId,
    eventId
  ) {
    return this.dao.findOne({
      user: userId,
      event: eventId,
      status: {
        $in: [
          "confirmed",
          "pending",
        ],
      },
    });
  }

  async getReservedQuantity(eventId) {
    const result = await this.dao.aggregate([
      {
        $match: {
          event: eventId,
          status: {
            $in: [
              "confirmed",
              "pending",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$event",
          reservedQuantity: {
            $sum: "$quantity",
          },
        },
      },
    ]);

    return result[0]?.reservedQuantity || 0;
  }

  async countActiveTickets(eventId) {
    return this.dao.count({
      event: eventId,
      status: {
        $in: [
          "confirmed",
          "pending",
        ],
      },
    });
  }

  async findByUser(userId) {
    return this.dao.find(
      {
        user: userId,
      },
      {
        populate: {
          path: "event",
          select:
            "title date location capacity status",
        },
        sort: {
          createdAt: -1,
        },
        lean: true,
      }
    );
  }

  async findByEvent(eventId) {
    return this.dao.find(
      {
        event: eventId,
      },
      {
        populate: {
          path: "user",
          select:
            "first_name last_name email role",
        },
        sort: {
          createdAt: -1,
        },
        lean: true,
      }
    );
  }

  async cancelTicket(ticketId) {
    return this.dao.updateById(
      ticketId,
      {
        status: "cancelled",
        cancelledAt: new Date(),
      }
    );
  }

  async save(ticket) {
    return this.dao.save(ticket);
  }

  async updateById(id, data) {
    return this.dao.updateById(
      id,
      data
    );
  }

  async exists(filter) {
    return this.dao.exists(filter);
  }
}

const ticketDAO = new TicketDAO();

const ticketsRepository =
  new TicketsRepository(ticketDAO);

export default ticketsRepository;