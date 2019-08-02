const Repository = require("../Repository");

class EventRepository extends Repository {
    
    getName(){
        return "eventrepository";
    }

    getEntity() {
        return "Event";
    }

    async doesEventExistsWithName(name){
        const entity = await this.entity.findOne({ name: name });
        console.log("exitsts?");
        return entity != null;
    }

}

module.exports = EventRepository;