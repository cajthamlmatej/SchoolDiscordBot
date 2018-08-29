const Command = require("./Command");
const Discord = require('discord.js');

class RoleCommand extends Command {

    getName() {
        return "role";
    }
    getUsage() {
        return "role <role>"
    }
    getGroup(){
        return "main";
    }
    getRoles(){
        return ["member"];
    }
    getHelp() {
        return "Přidá nebo odebere zadanou roli."
    }

    init(bot) {
        this.roleModule = bot.modules["rolemodule"];
    }

    call(args, channel, user){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let role = args[0];

        if(!this.roleModule.isRole(role)){
            this.sendError(channel, "Žádnou roli s tímto jménem jsme nenašli. Seznam všech rolí vypíšete pomocí příkazu rolelist.")

            return;
        }
        
        if(!this.roleModule.canBeAssigned(role)){
            this.sendError(channel, "Nemůžete si odebrat zákládni roli pro členství.")

            return;
        }
        
        this.roleModule.addRole(user, role, channel);
        return false;
    }

}

module.exports = RoleCommand;