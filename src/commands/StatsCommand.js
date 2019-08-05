const Command = require("./Command");
const Discord = require("discord.js");
const Config = require("../Config");
const Translation = require("../Translation");

class StatsCommand extends Command {

    getName() {
        return "stats";
    }

    getGroup() {
        return "manage";
    }

    getRoles() {
        return ["owner"];
    }

    init(bot) {
        this.client = bot.client;
        this.eventArchiveChannel = bot.client.channels.find(ch => ch.id == Config.get("channels.event-archive"));
        this.eventChannel = bot.client.channels.find(ch => ch.id == Config.get("channels.event"));
    }

    call(args, message) {
        const channel = message.channel;

        this.next(null, this.eventChannel).then(currentMessages => {
            this.next(null, this.eventArchiveChannel).then(currentMessagesArchive => {
                const messages = currentMessages.concat(currentMessagesArchive);
                const subjects = {};
                const authors = {};
                const groups = {};

                messages.forEach(message => {
                    if (message.embeds.length > 0) 
                        message.embeds.forEach(embed => {
                            embed.fields.forEach(field => {
                                if (field.name == "Předmět" || field.name == "Subject") 
                                    if (subjects[field.value] == undefined) {
                                        subjects[field.value] = 1;
                                    } else {
                                        subjects[field.value] += 1;
                                    }
                                else if (field.name == "Skupina" || field.name == "Group") 
                                    if (groups[field.value] == undefined) {
                                        groups[field.value] = 1;
                                    } else {
                                        groups[field.value] += 1;
                                    }

                            });

                            if (embed.footer != null && embed.footer.text != "null") 
                                if (authors[embed.footer.text] == undefined) {
                                    authors[embed.footer.text] = 1;
                                } else {
                                    authors[embed.footer.text] += 1;
                                }
                            else 
                            if (authors["?"] == undefined) 
                                authors["?"] = 1;
                            else 
                                authors["?"] += 1;
                            
                        });
                    
                });

                const sortedSubjectsKeys = Object.keys(subjects).sort(function (a, b) { return subjects[a] - subjects[b]; }).reverse();

                let subjectsStr = "";

                sortedSubjectsKeys.forEach(name => {
                    subjectsStr += Translation.translate("command.stats.for", "**" + (subjects[name] + "").padStart(2, "0") + "**", "**" + name + "**") + "\n";
                });

                const sortedAuthorsKeys = Object.keys(authors).sort(function (a, b) { return authors[a] - authors[b]; }).reverse();

                let authorsStr = "";

                sortedAuthorsKeys.forEach(name => {
                    authorsStr += Translation.translate("command.stats.from", "**" + (authors[name] + "").padStart(2, "0") + "**", "*" + name + "*") + "\n";
                });

                const sortedGroupsKeys = Object.keys(groups).sort(function (a, b) { return groups[a] - groups[b]; }).reverse();

                let groupsStr = "";

                sortedGroupsKeys.forEach(name => {
                    groupsStr += Translation.translate("command.stats.for", "**" + (groups[name] + "").padStart(2, "0") + "**", name) + "\n";
                });

                const embed = new Discord.RichEmbed()
                    .setTitle("📜 | " + Translation.translate("command.stats.title"))
                    .addField(Translation.translate("command.stats.number-of-events"), "**" + messages.size + "**", false)
                    .addField(Translation.translate("command.stats.authors"), authorsStr, true)
                    .addField(Translation.translate("command.stats.for-groups"), groupsStr, true)
                    .addField(Translation.translate("command.stats.for-subjects"), subjectsStr, true)
                    .setColor(Config.getColor("SUCCESS"));

                channel.send(embed);
            });
        });

        return false;
    }

    getMessages(last, channel) {
        if (last != null) 
            return channel.fetchMessages({ limit: 100, before: last });
        else 
            return channel.fetchMessages({ limit: 100 });
        
    }

    next(messages, channel) {
        const self = this;
        let promise = null;

        if (messages == null) 
            promise = this.getMessages(null, channel);
        else 
            promise = this.getMessages(messages.last().id, channel);

        return promise.then(currentMessages => {
            if (currentMessages.size == 100) {
                if (messages == null) {
                    messages = currentMessages;
                    return self.next(messages, channel);
                }
                return self.next(messages.concat(currentMessages), channel);
            } else {

                if (messages == null) {
                    messages = currentMessages;
                    return messages;
                }
                return messages.concat(currentMessages);
            }
        });
    }

}

module.exports = StatsCommand;