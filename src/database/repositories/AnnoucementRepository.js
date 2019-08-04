const Repository = require("../Repository");

class AnnoucementRepository extends Repository {
    
    getName(){
        return "annoucementrepository";
    }

    getEntity() {
        return "Annoucement";
    }

    async doesAnnoucementExistsWithName(name){
        const entity = await this.entity.findOne({ name: name, deleted: false });
        return entity != null;
    }

    async getAnnoucementByName(name, fields = null){
        return await this.entity.findOne({ name: name, deleted: false }, fields);
    }

    async deleteAnnoucement(name){
        await this.entity.updateOne({ name: name, deleted: false }, {
            deleted: true
        });
    }
    async editAnnoucement(name, values) {
        await this.entity.updateOne({ name: name, deleted: false }, values);
    }

    async getAnnoucements(fields = null) {
        return await this.entity.find({ deleted: false }, fields);
    }

}

module.exports = AnnoucementRepository;