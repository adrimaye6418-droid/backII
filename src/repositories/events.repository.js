import EventModel from "../models/event.js";

class EventsRepository {
    async create(data) {
        return EventModel.create(data);
    }

    async findById(id) {
        return EventModel.findById(id).populate(
            "organizer", 
            "first_name last_name email role");
    }

    async findByIdWithoutPopulate(id) {
        return EventModel.findById(id);
    }

    async findPaginated({
            filter,
            skip,
            limit,
            sort,
        }) {
            return EventModel.find(filter)
                .populate("organizer", "first_name last_name email role")
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .lean();
        }

    async count(filter) {
            return EventModel.countDocuments(filter);
        }

    async save(event) {
            return event.save();
        }

    }

    export default new EventsRepository();


    
