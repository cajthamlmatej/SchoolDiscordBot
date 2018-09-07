const Module = require("./Module");
const fs = require('fs');
const moment = require('moment');

class MuteModule extends Module {

    getName() {
        return "mutemodule";
    }

    init(bot) {
        this.guild = bot.client.channels.find(channel => channel.id === bot.settings.channels.vote).guild;
        this.muteRole = bot.settings.modules.mute.role;
        this.moderatorRole = bot.settings.roles.permission.moderator;

        this.tempFile = "./temp/mutes.json";

        this.tick();
        setInterval(() => this.tick(), 10000);
    }

    tick(){
        let mutes = this.getMutes();
        let toRemove = [];

        Object.keys(mutes).forEach(userId => {
            let mute = mutes[userId];
            let current = moment().format("X");
            let expiration = mute.expiration;

            if(current > expiration){
                toRemove.push(userId);

                this.setMuteRoles(userId, mute.roles);
            }
        });

        this.removeMutesFromFile(toRemove);
    }

    addMute(member, lengthInMinutes, reason){
        let mutes = fs.readFileSync(this.tempFile, "utf8");
        let mutesObject = JSON.parse(mutes); 

        let expiration = moment().add(lengthInMinutes, "m").format("X");
        let roles = [];
 
        member.roles.forEach(role => {
            roles.push(role.id);
        });

        member.setRoles([this.muteRole]).then(member => {
            mutesObject["mutes"][member.user.id] = {expiration: expiration, reason: reason, roles: roles};

            fs.writeFileSync(this.tempFile, JSON.stringify(mutesObject));
        }).catch(console.error);
    }

    setMuteRoles(userId, muteRoles){
        this.guild.fetchMember(userId).then(member => {
            member.setRoles(muteRoles);
        });

    }

    removeMute(member){
        let mute = this.getMute(member.user.id);
        this.setMuteRoles(member.user.id, mute.roles);

        this.removeMuteFromFile(member.user.id);
    }

    getMutes(){
        let mutes = fs.readFileSync(this.tempFile, "utf8");
        let mutesObject = JSON.parse(mutes);

        return mutesObject["mutes"];
    }

    getMute(userId){
        let mutes = fs.readFileSync(this.tempFile, "utf8");
        let mutesObject = JSON.parse(mutes);

        return mutesObject["mutes"][userId];
    }

    removeMuteFromFile(userId){
        let mutes = fs.readFileSync(this.tempFile, "utf8");
        let mutesObject = JSON.parse(mutes);

        delete mutesObject["mutes"][userId];

        fs.writeFileSync(this.tempFile, JSON.stringify(mutesObject));
    }
    
    removeMutesFromFile(ms){
        let mutes = fs.readFileSync(this.tempFile, "utf8");
        let mutesObject = JSON.parse(mutes);

        ms.forEach(mute => {
            delete mutesObject["mutes"][mute];
        });

        fs.writeFileSync(this.tempFile, JSON.stringify(mutesObject));
    }

    isMuted(member){
        let mutes = fs.readFileSync(this.tempFile, "utf8");
        let mutesObject = JSON.parse(mutes); 

        return mutesObject["mutes"][member.user.id] != undefined;
    }

    canBeMuted(member){
        return member.roles.find(r => r.id == this.moderatorRole) == undefined;
    }

    event(name, args){
    }

}

module.exports = MuteModule;