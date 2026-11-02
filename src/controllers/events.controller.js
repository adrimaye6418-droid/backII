import mongoose from "mongoose";
import EventModel from "../models/event.js";


export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location } = req.body;
    
    if (!title || !date || !location) {
      return res.status(400).json({
        status: "error",
        message: "título, fecha y ubicación son obligatorios",
      });
    }

    const event = new EventModel({
      title,
      description,
      date,
      location,
      status: "published",
      organizer: req.user._id || req.user.id,
    });

    await event.save();

    return res.status(201).json({
      status: "success",
      payload: {
        id: event._id,
        title: event.title,
        organizer: event.organizer,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishedEvents = async (req, res, next) => {
  try {
    const allEvents = await EventModel.find({
      published: true
    })
    const publishedEvents = await EventModel.find({
      status: "published"
    })
    const events = await EventModel.find({
      status: "published"
    })
    
    return res.status(200).json({
      status: "success",
      payload: events,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isOwner = 
         event.organizer.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: "error",
        message: "No tenés permisos para actualizar este evento",
      });
    }

    const allowedUpdates = [
      "title", 
      "description", 
      "date", 
      "location", 
      "status",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    return res.status(200).json({
      status: "success",
      payload: {
        id: event._id,
        title: event.title,
        organizer: event.organizer,
      },
    });
  } catch (error) {
    next(error);
  };
}