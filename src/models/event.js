import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        date: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["draft", "published",  "cancelled"],
            default: "published",
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },  
      },
    {
        timestamps: true,
    }
);

const EventModel = mongoose.model("Event", eventSchema);

export default EventModel;