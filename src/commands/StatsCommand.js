const Command = require("./Command");
const Discord = require("discord.js");
const Config = require("../Config");
const Translation = require("../Translation");

const eventRepository = require("../database/Database").getRepository("event");

class StatsCommand extends Command {

    getName() {
        return "stats";
    }

    getGroup() {
        return "manage";
    }

    getRoles() {
        return ["moderator"];
    }

    init(bot) {
        this.client = bot.client;
        this.eventArchiveChannel = bot.client.channels.find(ch => ch.id == Config.get("channels.event-archive"));
        this.eventChannel = bot.client.channels.find(ch => ch.id == Config.get("channels.event"));
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) 
            await callback(array[index], index, array);
    }

    async call(args, message) {
        const channel = message.channel;

        const eventCount = {
            all: await eventRepository.countEvents(),
            //active: await eventRepository.countEvents(false),
            archived: await eventRepository.countEvents(true),
            
            eventAll: await eventRepository.countEventsByType("event"),
            taskAll: await eventRepository.countEventsByType("task"),

            //eventActive: await eventRepository.countEventsByType("event", false),
            //taskActive: await eventRepository.countEventsByType("task", false),
            
            eventArchived: await eventRepository.countEventsByType("event", true),
            taskArchived: await eventRepository.countEventsByType("task", true),
        }

        const members = [];
        
        await this.asyncForEach(await eventRepository.getEventsAuthors(), async (author) => {
            members.push({
                member: await channel.guild.fetchMember(author).then((member) => {return member;}),
                count: {
                    all: await eventRepository.countEventsByAuthor(author),
                    //active: await eventRepository.countEventsByAuthor(author, false),
                    //archived: await eventRepository.countEventsByAuthor(author, true)
                }
            });
        });

        let membersText = "";

        members.forEach(member => {
            membersText += Translation.translate("command.stats.from", "**" + (member.count.all + "").padStart(2, "0") + "**", "*" + member.member.toString() + "*") + "\n";
        });

        const subjects = [];

        await this.asyncForEach(await eventRepository.getEventsSubjects(), async (subject) => {
            subjects.push({
                subject: subject,
                count: await eventRepository.countEventsBySubject(subject)
            })
        });

        let subjectsText = "";
        
        subjects.forEach(subject => {
            subjectsText += Translation.translate("command.stats.for", "**" + (subject.count + "").padStart(2, "0") + "**", "**" + subject.subject + "**") + "\n";
        });

        const roles = [];

        await this.asyncForEach(await eventRepository.getEventsRoles(), async (role) => {
            roles.push({
                role: {
                    name: role,
                    role: await channel.guild.roles.get(Config.get("roles.mentionable." + role)) 
                },
                count: await eventRepository.countEventsByRole(role)
            })
        });

        let rolesText = "";
        
        roles.forEach(role => {
            rolesText += Translation.translate("command.stats.for", "**" + (role.count + "").padStart(2, "0") + "**", role.role.role.toString()) + "\n";
        });

        const embed = new Discord.RichEmbed()
            .setTitle("📜 | " + Translation.translate("command.stats.title"))
            .addField(Translation.translate("command.stats.number-of-events"), Translation.translate("command.stats.count-all", eventCount.all, eventCount.archived, Math.round(eventCount.all / 193 * 100) / 100), true)
            .addField(Translation.translate("command.stats.types"), Translation.translate("command.stats.count-all", eventCount.eventAll, eventCount.eventArchived, eventCount.taskAll, eventCount.taskArchived), true)
            .addBlankField()
            .addField(Translation.translate("command.stats.for-subjects"), subjectsText, true)
            .addField(Translation.translate("command.stats.for-groups"), rolesText, true)
            .addField(Translation.translate("command.stats.authors"), membersText, true)
            .setColor(Config.getColor("SUCCESS"));

        channel.send(embed);
    }

}

module.exports = StatsCommand;