const Repository = require("../Repository");

class MuteRepository extends Repository {
    
    getName(){
        return "muterepository";
    }

    getEntity() {
        return "Mute";
    }

    async isMuted(user){
        const entity = await this.entity.findOne({ user: user, deleted: false }, "");
        return entity != null;
    }

    async deleteMute(user) {
        await this.entity.updateOne({ user: user, deleted: false }, {deleted: true});
    }

    async getMute(user){
        return await this.entity.findOne({ user: user, deleted: false });
    }

    async getMutes() {
        return await this.entity.find({deleted: false });
    }
}

module.exports = MuteRepository;