const Repository = require("../Repository");

class BakalariRepository extends Repository {
    
    getName() {
        return "bakalarirepository";
    }

    getEntity() {
        return "Bakalari";
    }

    async doesBakalariExistsWithGuid(guid) {
        const entity = await this.entity.findOne({ guid: guid }, "");
        return entity != null;
    }

}

module.exports = BakalariRepository;