const Module = require("./Module");
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');

class MuteModule extends Module {

    getName() {
        return "mutemodule";
    }

    init(client, settings, commands) {
        this.guild = client.channels.find(channel => channel.id === settings.channels["vote"]).guild;
        this.muteRole = settings["mute-role"];

        this.tick();
        setInterval(() => this.tick(), 10000);
    }

    tick(){
        let mutes = fs.readFileSync("./temp/mutes.json", "utf8");
        let mutesObject = JSON.parse(mutes); 

        let toRemove = [];

        Object.keys(mutesObject["mutes"]).forEach(userId => {
            let mute = mutesObject["mutes"][userId];
            let current = moment().format("X");
            let expiration = mute.expiration;

            if(current > expiration){
                toRemove.push(userId);

                this.guild.fetchMember(userId).then(member => {
                    member.setRoles(mute.roles);
                });
            }
        });

        toRemove.forEach(remove => {
            delete mutesObject["mutes"][remove];
        });

        fs.writeFileSync("./temp/mutes.json", JSON.stringify(mutesObject));
    }

    event(name, args){
    }

}

module.exports = MuteModule;