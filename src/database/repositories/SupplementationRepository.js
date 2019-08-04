const Repository = require("../Repository");

class SupplementationRepository extends Repository {
    
    getName(){
        return "supplementationrepository";
    }

    getEntity() {
        return "Supplementation";
    }

    async doesSupplementationExistsWithName(name){
        const entity = await this.entity.findOne({ name: name, archived: false });
        return entity != null;
    }

    async getSupplementationByDay(name){
        return await this.entity.findOne({ name: name, archived: false });
    }

    async getSupplementations(){
        return await this.entity.find({ archived: false });
    }

    async archiveSupplementation(name){
        await this.entity.updateOne({ name: name, archived: false }, { archived: true });
    }
}

module.exports = SupplementationRepository;