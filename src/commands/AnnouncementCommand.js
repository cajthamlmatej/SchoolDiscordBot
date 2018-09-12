const SubsCommand = require("./SubsCommand");

class AnnouncementCommand extends SubsCommand {

    getSubCommands(){
        return {
            "create": {
                "arguments": 3
            },
            "list": {
                "arguments": 0
            },
            "edit": {
                "arguments": 3
            },
            "delete": {
                "arguments": 1
            }
        }
    }

    getName() {
        return "annoucement";
    }

    getGroup(){
        return "manage";
    }

    getAliases(){
        return [ "annouce" ];
    }

    init(bot) {
        this.annoucementModule = bot.modules["annoucementmodule"];
    }

    callList(args, message){
        this.annoucementModule.listAnnoucements(message.member);

        return false;
    }

    callEdit(args, message){
        let channel = message.channel;
        let [name, type, value] = args;
        
        let types = ["title", "annoucement"];
        if (!types.includes(type)) {
            this.sendError(channel, "command.annoucement.edit-type-not-valid", types.join(", "));
            return;
        }

        if(!this.annoucementModule.annoucementExist(name)){
            this.sendError(channel, "command.annoucement.dont-exist");
            return;
        }

        this.annoucementModule.editAnnoucement(message.member, name, type, value);

        return false;
    }
    
    callDelete(args, message){
        let channel = message.channel;
        let name = args[0];

        if(!this.annoucementModule.annoucementExist(name)){
            this.sendError(channel, "command.annoucement.dont-exist");
            return;
        }

        this.annoucementModule.deleteAnnoucement(channel, name);
    
        return false;
    }

    callCreate(args, message){
        let channel = message.channel;

        let [name, title, annoucement] = args;

        if(this.annoucementModule.annoucementExist(name)){
            this.sendError(channel, "command.annoucement.already-exists");
            return;
        }

        this.annoucementModule.addAnnoucement(message.member, name, title, annoucement);

        return false;
    }

}

module.exports = AnnouncementCommand;