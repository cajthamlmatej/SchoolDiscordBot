const Repository = require("../Repository");

class EventRepository extends Repository {
    
    getName() {
        return "eventrepository";
    }

    getEntity() {
        return "Event";
    }

    async doesEventExistsWithName(name) {
        const entity = await this.entity.findOne({ name: name, archived: false, deleted: false });
        return entity != null;
    }

    async getEvents(archived = false, fields = null) {
        if(fields != null)
            return await this.entity.find({ archived: archived, deleted: false }, fields);
    
        return await this.entity.find({ archived: archived, deleted: false });
    }

    async getEventByName(name) {
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

}

module.exports = EventRepository;