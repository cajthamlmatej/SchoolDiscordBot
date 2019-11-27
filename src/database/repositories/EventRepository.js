const Repository = require("../Repository");

class EventRepository extends Repository {

    getName() {
        return "eventrepository";
    }

    getEntity() {
        return "Event";
    }

    async doesEventExistsWithName(name) {
        const entity = await this.entity.findOne({ name: name, deleted: false });
        return entity != null;
    }

    async getEvents(archived = false, fields = null) {
        if (fields != null)
            return await this.entity.find({ archived: archived, deleted: false }, fields);

        return await this.entity.find({ archived: archived, deleted: false });
    }

    async getAllEvents() {
        return await this.entity.find({ deleted: false });
    }

    async getEventByName(name, archived = false) {
        if (archived == null)
            return await this.entity.findOne({ name: name, deleted: false });
        return await this.entity.findOne({ name: name, archived: false, deleted: false });
    }

    async deleteEvent(name) {
        await this.entity.updateOne({ name: name, archived: false, deleted: false }, {
            deleted: true
        });
    }

    async archiveEvent(name) {
        await this.entity.updateOne({ name: name, archived: false, deleted: false }, {
            archived: true
        });
    }
    async unarchiveEvent(name) {
        await this.entity.updateOne({ name: name, archived: true, deleted: false }, {
            archived: false
        });
    }

    async editEvent(name, values) {
        await this.entity.updateOne({ name: name, archived: false, deleted: false }, values);
    }

    async getEventsNames() {
        const names = [];
        const entites = await this.entity.find({ archived: false, deleted: false }, "name");

        entites.forEach(entity => {
            names.push(entity.name);
        });

        return names;
    }

    async countEvents(archived = null) {
        if (archived == true)
            return await this.entity.countDocuments({ archived: true, deleted: false });
        else if (archived == false)
            return await this.entity.countDocuments({ archived: false, deleted: false });

        return await this.entity.countDocuments({ deleted: false });
    }

    async countEventsByType(type, archived = null) {
        if (archived == true)
            return await this.entity.countDocuments({ archived: true, type: type, deleted: false });
        else if (archived == false)
            return await this.entity.countDocuments({ archived: false, type: type, deleted: false });

        return await this.entity.countDocuments({ type: type, deleted: false });
    }

    async getEventsAuthors() {
        return await this.entity.find({ deleted: false }).distinct("author");
    }

    async countEventsByAuthor(author, archived = null) {
        if (archived == true)
            return await this.entity.countDocuments({ archived: true, author: author, deleted: false });
        else if (archived == false)
            return await this.entity.countDocuments({ archived: false, author: author, deleted: false });

        return await this.entity.countDocuments({ author: author, deleted: false });
    }

    async getEventsSubjects() {
        return await this.entity.find({ deleted: false }).distinct("subject");
    }

    async countEventsBySubject(subject) {
        return await this.entity.countDocuments({ subject: subject, deleted: false });
    }

    async getEventsRoles() {
        return await this.entity.find({ deleted: false }).distinct("role");
    }

    async countEventsByRole(role) {
        return await this.entity.countDocuments({ role: role, deleted: false });
    }

    async getEventsThatEndAtDay(day) {
        return await this.entity.find({
            deleted: false,
            end: { $regex: "^" + day },
            start: { $regex: "!^" + day }
        });
    }

    async getEventsThatStartAtDay(day) {
        return await this.entity.find({
            deleted: false,
            end: { $regex: "!^" + day },
            start: { $regex: "^" + day }
        });
    }

    async getEventsThatGoingAtDay(day) {
        return await this.entity.find({
            deleted: false,
            end: { $regex: "^" + day },
            start: { $regex: "^" + day }
        });
    }
    async getArchivedEvents(archived = true, fields = null) {
        if (fields != null)
            return await this.entity.find({ archived: archived, deleted: false }, fields);

        return await this.entity.find({ archived: archived, deleted: false });
    }

    async doesArchivedEventExistsWithName(name) {
        const entity = await this.entity.findOne({ name: name, archived: true, deleted: false });
        return entity != null;
    }

    async getArchivedEventByName(name, archived = true) {
        if (archived == null)
            return await this.entity.findOne({ name: name, deleted: false });
        return await this.entity.findOne({ name: name, archived: true, deleted: false });
    }

}

module.exports = EventRepository;