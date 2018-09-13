const SubsCommand = require("./SubsCommand");

class RoleCommand extends SubsCommand {

    getSubCommands() {
        return {
            "update": {
                "arguments": 1
            },
            "list": {
                "arguments": 0
            }
        }
    }

    getName() {
        return "role";
    }

    getGroup() {
        return "main";
    }

    getRoles() {
        return ["member"];
    }

    getDependencies() {
        return ["rolemodule"];
    }

    init(bot) {
        this.roleModule = bot.modules.rolemodule;
    }

    callList(args, message) {
        let channel = message.channel;
        this.roleModule.printRoleList(channel);
    }

    callUpdate(args, message) {
        let channel = message.channel;
        if (args.length != 1) {
            this.sendHelp(channel);
            return;
        }

        let role = args[0];

        if (!this.roleModule.isRole(role)) {
            this.sendError(channel, "command.role.role-not-found")

            return;
        }

        this.roleModule.updateRole(message.author, role, channel);
    }


}

module.exports = RoleCommand;