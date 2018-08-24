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

    init(client, settings, commands) {
        this.roles = settings.roles;
    }

    call(args, channel, user){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let role = args[0];
        let roles = Object.keys(this.roles);

        if(!roles.includes(role)){
            this.sendError(channel, "Žádnou roli s tímto jménem jsme nenašli. Seznam všech rolí vypíšete pomocí příkazu rolelist.")

            return;
        }
        
        if(role == "member"){
            this.sendError(channel, "Nemůžete si odebrat zákládni roli pro členství.")

            return;
        }
        
        let guild = channel.guild;

        guild.fetchMember(user).then(member => {
            let roleId = this.roles[role];
            if(member.roles.find(r => r.id == roleId) != undefined){
                member.removeRole(roleId).catch(console.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | Role odebrána")
                    .setDescription("Role " + role + " byla odebrána od tvého účtu.")
                    .setColor(0xe67e22);

                channel.send(embed);
            } else {
                member.addRole(roleId).catch(console.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | Role přiřazena")
                    .setDescription("Role " + role + " byla přiřazena k tvému účtu.")
                    .setColor(0xe67e22);

                channel.send(embed);
            }
        }).catch(console.error);

        return false;
    }

}

module.exports = RoleCommand;