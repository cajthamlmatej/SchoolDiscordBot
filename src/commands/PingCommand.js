
const Command = require("./Command");

class PingCommand extends Command {

    getName() {
        return "ping";
    }
    getUsage() {
        return "ping"
    }
    getGroup(){
        return "main";
    }
    getRoles(){
        return ["member"];
    }
    getHelp() {
        return "Je bot aktivní?"
    }

    init(bot) {
    }

    call(args, channel, author, message){
        message.react("✅");

        return false;
    }

}

module.exports = PingCommand;