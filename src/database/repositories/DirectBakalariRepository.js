const Repository = require("../Repository");

class DirectBakalariRepository extends Repository {
    
    getName(){
        return "directbakalarirepository";
    }

    getEntity() {
        return "DirectBakalari";
    }

    async getAllUsers(fields = null) {
        return await this.entity.find({}, fields);
    }

    async getUser(id){
        return await this.entity.findOne({user: id});
    }

}

module.exports = DirectBakalariRepository;