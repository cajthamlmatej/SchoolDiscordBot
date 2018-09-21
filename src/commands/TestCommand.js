const Command = require("./Command");
const Discord = require('discord.js');
const CommandBuilder = require("../CommandBuilder");
const moment = require('moment');

class TestCommand extends Command {

    getName() {
        return "test";
    }

    getGroup() {
        return "manage";
    }

    init(bot) {
        this.eventModule = bot.modules["eventmodule"];
    }

    call(args, message) {
        let channel = message.channel;
        
        let types = ["event", "task"];
        let builder = new CommandBuilder(message.author, [
            {
                "name": "name",
                "title": "Jméno události / úkolu",
                "help": "Zadejte unikátní jméno eventu pro jeho budoucí manipulaci.",
                "example": "stp_ukol_potreby",
                "validate": (content) => {
                    if(this.eventModule.exists(content)){
                        return "command.event.already-exists";
                    } else {
                        return true;
                    }
                }
            },
            {
                "name": "type",
                "title": "Typ eventu",
                "help": "Zadejte, o jaký typ eventu se jedná.",
                "example": types,
                "validate": (content) => {
                    if(!types.includes(content)){
                        return "command.event.type-not-valid";
                    } else 
                        return true;
                }
            },
            {
                "name": "start",
                "title": "Začátek eventu",
                "help": "Zadejte datum (a čas) začátku události.",
                "example": ["11. 9. 2018", "11. 9. 2018 8:00"],
                "validate": (content) => {
                    if(!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY").isValid())){
                        return "command.event.wrong-date-format";
                    } else
                        return true;
                }
            },
            {
                "name": "end",
                "title": "Konec eventu",
                "help": "Zadejte datum (a čas) konce události nebo nevyplnujte (použijte znak \"-\").",
                "example": ["-", "12. 9. 2018", "12. 9. 2018 13:30"],
                "validate": (content) => {
                    if(content == "-")
                        return true;

                    if(!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY").isValid())){
                        return "command.event.wrong-date-format";
                    } else
                        return true;
                },
                "value": (content, values) => {
                    return values["start"];
                }
            },
            {
                "name": "role",
                "title": "Role",
                "help": "Zadejte jméno role, pro kterou je event určený.",
                "example": "member",
                "validate": (content) => {
                    if(!this.eventModule.isMentionableRole(content)){
                        return "command.event.role-not-valid";
                    } else
                        return true;
                }
            },
            {
                "name": "place",
                "title": "Místo",
                "help": "Zadejte místo, kde se event udehrává.",
                "example": ["Škola", "Arbesovo náměstí"],
                "validate": (content) => {
                    return true;
                }
            },
            {
                "name": "subject",
                "title": "Předmět",
                "help": "Zadejte předmět o kterem event je.",
                "example": ["STP", "?"],
                "validate": (content) => {
                    return true;
                }
            },
            {
                "name": "description",
                "title": "Popis",
                "help": "Zadejte jakékoliv další informace, které o eventu víte.",
                "example": "Vytvořte svůj vlastní životopis a odevzdejte ho do uvedeného datumu. Platí i pro lidi, které se hodiny nezúčastnili.",
                "validate": (content) => {
                    return true;
                }
            }
        ], channel, "Přidání nové události / úkolu");
        
        builder.start();

        return true;
    }

}

module.exports = TestCommand;