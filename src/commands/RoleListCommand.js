
const Command = require("./Command");

class RoleListCommand extends Command {

    getName() {
        return "rolelist";
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
        this.roleModule.printRoleList(channel);
        
        message.react("✅");
        return false;
    }

}

module.exports = RoleListCommand;