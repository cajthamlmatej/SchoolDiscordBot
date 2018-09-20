const Discord = require('discord.js');

class CommandBuilder {

    constructor(user, fields, channel){
        this.build = {user: user, fields: fields, channel: channel};
        this.field = 0;
    }

    start() {
        this.collector = new Discord.MessageCollector(this.build.channel, m => m.author.id === this.build.user.id, { time: 10000 });
        this.collector.on("collect", this.collect);
    }

    collect(message) {
        console.log("collected: " + message.content);
    }

}

module.exports = CommandBuilder;