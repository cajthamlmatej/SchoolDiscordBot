const Repository = require("../Repository");

class BakalariRepository extends Repository {
    
    getName(){
        return "bakalarirepository";
    }

    getEntity() {
        return "Bakalari";
    }

    async doesBakalariExistsWithGuid(guid){
        const entity = await this.entity.findOne({ guid: guid }, "");
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

module.exports = BakalariRepository;