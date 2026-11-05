import mongoose from "mongoose";
import EventModel from "../models/event.js";
import eventsService from "../services/events.service.js";

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent(req.body, req.user);
    
    return res.status(201).json({
      status: "success",
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const result = await eventsService.getEvents(req.query);
    return res.status(200).json({
      status: "success",
      payload: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(req.params.id);
    return res.status(200).json({
      status: "success",
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent(
      req.params.id,
      req.body,
      req.user
    );
    return res.status(200).json({
      status: "success",
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};

export const changeEventStatus = async (req, res, next) => {
  try {
    const event = await eventsService.changeStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    return res.status(200).json({
      status: "success",
      payload: event,
    });
  } catch (error) {
    next(error);
  }
};