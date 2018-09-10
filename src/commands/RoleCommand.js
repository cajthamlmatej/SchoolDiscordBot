const Command = require("./Command");

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
    getDependencies(){
        return [ "rolemodule" ];
    }

    init(bot) {
        this.roleModule = bot.modules.rolemodule;
    }

    call(args, channel, user){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let role = args[0];

        if(!this.roleModule.isRole(role)){
            this.sendError(channel, "command.role.role-not-found")

            return;
        }
        
        this.roleModule.addRole(user, role, channel);
        return false;
    }

}

module.exports = RoleCommand;