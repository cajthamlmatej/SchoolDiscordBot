
const Command = require("./Command");

class EventCreateCommand extends Command {

    getName() {
        return "eventcreate";
    }
    getUsage() {
        return "eventcreate <udalost/ukol> <od kdy> <do kdy> <role> <místo> <předmět> <popis>"
    }
    getGroup(){
        return "school";
    }
    getHelp() {
        return "Vytvoří událost/úkol, který se po týdnu archívuje."
    }
    getAliases(){
        return [ "createev" ];
    }

    init(bot) {
        this.eventModule = bot.modules["eventmodule"];

        this.roles = bot.settings.roles;
    }

    call(args, channel){
        if(args.length != 7){
            this.sendHelp(channel);
            return;
        }

        let type = args[0];

        if(type !== "udalost" && type !== "ukol"){
            this.sendError(channel, "Zadal jste špatný typ eventu, musí se jednat o `udalost` nebo `ukol`");
            return;
        }
        

        let from = args[1];
        let to = args[2];


        let role = args[3];
        let roles = Object.keys(this.roles);

        if(!roles.includes(role)){
            this.sendError(channel, "Žádnou roli s tímto jménem jsme nenašli. Seznam všech rolí vypíšete pomocí příkazu rolelist.")

            return;
        }
        
        let place = args[4];
        let subject = args[5];
        let description = args[6];
     
        this.eventModule.addEvent(type, from, to, role, place, subject, description);

        return false;
    }

}

module.exports = EventCreateCommand;