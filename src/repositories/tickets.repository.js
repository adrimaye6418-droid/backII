import TicketModel from "../models/ticket.js";

class TicketsRepository {
  async create(data) {
    return TicketModel.create(data);
  }

  async findById(id) {
    return TicketModel.findById(id);
  }

  async findByIdWithDetails(id) {
    return TicketModel.findById(id)
      .populate("user", "first_name last_name email role")
      .populate("event", "title date location capacity status organizer");
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return TicketModel.findOne({
      user: userId,
      event: eventId,
      status: {
        $in: ["confirmed", "pending"],
      },
    });
  }

  async getReservedQuantity(eventId) {
    const result = await TicketModel.aggregate([
      {
        $match: {
          event: eventId,
          status: {
            $in: ["confirmed", "pending"],
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

    return result.length > 0
      ? result[0].reservedQuantity
      : 0;
  }

  async findByUser(userId) {
    return TicketModel.find({
      user: userId,
    })
      .populate("event", "title date location")
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByEvent(eventId) {
    return TicketModel.find({
      event: eventId,
    })
      .populate("user", "first_name last_name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  async save(ticket) {
    return ticket.save();
  }
}

export default new TicketsRepository();