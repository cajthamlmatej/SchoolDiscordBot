const Command = require("./Command");

class RoleCommand extends Command {

    getName() {
        return "role";
    }

    getGroup(){
        return "main";
    }
    
    getRoles(){
        return ["member"];
    }
    
    getDependencies(){
        return [ "rolemodule" ];
    }

    init(bot) {
        this.roleModule = bot.modules.rolemodule;
    }

    call(args, message) {
        let channel = message.channel;
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let role = args[0];

        if(!this.roleModule.isRole(role)){
            this.sendError(channel, "command.role.role-not-found")

            return;
        }
        
        this.roleModule.addRole(message.author, role, channel);
        return false;
    }

}

module.exports = RoleCommand;