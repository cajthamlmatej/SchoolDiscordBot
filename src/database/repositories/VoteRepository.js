const Repository = require("../Repository");

class VoteRepository extends Repository {
    
    getName(){
        return "voterepository";
    }

    getEntity() {
        return "Vote";
    }

    async doesVoteExistsWithName(name){
        const entity = await this.entity.findOne({ name: name, deleted: false }, "");
        return entity != null;
    }

    async getVote(name){
        return await this.entity.findOne({ name: name, deleted: false });
    }

    async getVotes(){
        return await this.entity.find({ deleted: false});
    }

    async deleteVote(name){
        await this.entity.updateOne({ name: name, deleted: false}, {deleted: true});
    }

}

module.exports = VoteRepository;