import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio"],
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "El evento es obligatorio"],
    },

    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
      lowercase: true,
    },

    quantity: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [1, "La cantidad debe ser mayor que cero"],
    },

    reservationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "tickets",
  }
);

ticketSchema.index(
  { user: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["confirmed", "pending"] },
    },
  }
);

const TicketModel = mongoose.model("Ticket", ticketSchema);

export default TicketModel;