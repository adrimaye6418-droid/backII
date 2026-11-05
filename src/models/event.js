import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "El título es obligatorio"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "La descripción es obligatoria"],
            trim: true,
            lowercase: true,
        },
        date: {
            type: Date,
            required: [true, "La fecha es obligatoria"],
        },
        location: {
            type: String,
            required: [true, "La ubicación es obligatoria"],
            trim: true,
        },
        capacity: {
            type: Number,
            required: [true, "La capacidad es obligatoria"],
            min: [1, "La capacidad debe ser al menos 1"],
        },
        price: {
            type: Number,
            required: [true, "El precio es obligatorio"],
            min: [0, "El precio no puede ser negativo"],
        },
        status: {
            type: String,
            enum: ["draft", "published",  "cancelled", "finalized"],
            default: "draft",
            lowercase: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },  
      },
    {
        timestamps: true,
        collection: "events",
    }
);

const EventModel = mongoose.model("Event", eventSchema);

export default EventModel;