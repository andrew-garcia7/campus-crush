import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth.middleware";
import { Event } from "../models/Event";

export const listEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { university, category, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: Record<string, any> = { isPublic: true };
    if (university) filter.university = university;
    if (category) filter.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await Event.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("organizer", "fullName photos");
    res.json({ success: true, message: "Events", data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getEvent = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    const data = await Event.findById(id).populate("organizer", "fullName photos").populate("attendees", "fullName photos");
    if (!data) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event", data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const data = await Event.create({ ...req.body, organizer: req.userId });
    res.status(201).json({ success: true, message: "Event created", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const rsvpEvent = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    const userId = req.userId!;
    const idx = event.attendees.findIndex((a) => a.toString() === userId);
    if (idx === -1) {
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ success: false, message: "Event is full" });
      }
      event.attendees.push(userId as any);
    } else {
      event.attendees.splice(idx, 1);
    }
    await event.save();
    res.json({ success: true, message: idx === -1 ? "RSVP'd" : "Cancelled", data: event });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};
