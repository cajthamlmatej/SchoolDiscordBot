const Discord = require("discord.js");
const Translation = require("./Translation");
const Config = require("./Config");

const activeBuilders = {};

const STOP_EMOTE = "🛑";
const BACK_EMOTE = "◀";

class CommandBuilder {

    constructor(name, user, channel, fields, end) {
        this.name = name;
        this.build = { user: user, fields: fields, channel: channel };
        this.field = 0;
        this.values = {};
        this.endFunction = end;
        this.reactionPromise = Promise.resolve();

        this.stopWord = Config.get("bot.builder.stop-word");
    }

    async start() {
        await this.build.channel.send(await this.generateHelpEmbed(this.build.fields[this.field])).then(async (message) => {
            this.message = message;
            this.messageCollector = new Discord.MessageCollector(this.build.channel, m => m.author.id === this.build.user.id && m.channel.id === this.build.channel.id);
            this.messageCollector.on("collect", (message) => { this.collectMessage(message); });
            this.messageCollector.on("end", (messages, reason) => { this.endMessage(messages, reason); });

            await this.refreshReactions();

            const filter = (reaction, user) => user.id === this.build.user.id;
            this.reactionCollector = message.createReactionCollector(filter);
            this.reactionCollector.on("collect", reaction => this.collectReaction(reaction) );

            if(activeBuilders[this.build.user.id] == undefined)
                activeBuilders[this.build.user.id] = [this.build.channel.id];
            else 
            if(activeBuilders[this.build.user.id].includes(this.build.channel.id)) 
                this.messageCollector.stop("forced-builder-exist");
            else
                activeBuilders[this.build.user.id].push(this.build.channel.id);
        });
        
    }

    async refreshReactions() {
        const field = this.build.fields[this.field];

        this.reactionPromise = this.reactionPromise.then(async () => {
            await this.message.clearReactions();
        });

        this.reactionPromise = this.reactionPromise.then(async () => {
            await this.message.react(BACK_EMOTE);
        });

        this.reactionPromise = this.reactionPromise.then(async () => {
            await this.message.react(STOP_EMOTE);
        });

        if (field.commands === undefined)
            return;
        
        const reactions = field["commands"].map(cmd => cmd.reaction);

        reactions.forEach(async (option) => {
            this.reactionPromise = this.reactionPromise.then(async () => await this.message.react(option));
        });
    }

    async collectMessage(message) {
        let messageContent = message.content;

        if (messageContent.toLowerCase() == this.stopWord.toLowerCase()) 
            this.messageCollector.stop("forced");
        else {
            const field = this.build.fields[this.field];
            if (field.value != undefined) 
                messageContent = await field.value(messageContent, this.values, message.attachments.array());

            const passed = await field.validate(messageContent, this.values);

            if (passed === true) {
                this.values[field.name] = messageContent;

                if (this.build.fields[this.field + 1] == undefined) 
                    this.messageCollector.stop("fieldEnd");
                else {
                    this.field += 1;

                    await this.message.edit(await this.generateHelpEmbed(this.build.fields[this.field]));
                    await this.refreshReactions();
                }
            } else 
                await this.message.edit(await this.generateHelpEmbed(this.build.fields[this.field], passed));

            message.delete().catch(() => {});
        }
    }

    async endMessage(messages, reason) {
        await this.message.edit(await this.generateEndEmbed(reason));

        this.reactionPromise = this.reactionPromise.then(async () => {
            await this.refreshReactions();
        });

        this.reactionPromise = this.reactionPromise.then(async () => {
            await this.reactionCollector.stop();
        });
        
        this.reactionPromise = this.reactionPromise.then(async () => {
            await this.message.clearReactions();
        });
        

        switch (reason) {
        case "forced-builder-exist":
            break;
        case "forced":
            activeBuilders[this.build.user.id] = activeBuilders[this.build.user.id].filter((item) => { 
                return item !== this.build.channel.id;
            });
            break;
        case "fieldEnd":
            activeBuilders[this.build.user.id] = activeBuilders[this.build.user.id].filter((item) => { 
                return item !== this.build.channel.id;
            });
            this.endFunction(this.values);
            break;
        }
    }

    async collectReaction(reaction) {
        if (reaction.emoji.name === STOP_EMOTE)
            return this.messageCollector.stop("forced");

        if (reaction.emoji.name === BACK_EMOTE) {
            if (this.field != 0) {
                this.field -= 1;

                await this.message.edit(await this.generateHelpEmbed(this.build.fields[this.field]));
                await this.refreshReactions();
            }

            return;
        }

        const field = this.build.fields[this.field];

        if (field.commands != undefined) {
            const reactions = field.commands.map(cmd => cmd.reaction);

            if(!reactions.includes(reaction.emoji.name))
                return;
            
            let value = field.commands.find(cmd => cmd.reaction === reaction.emoji.name).value;
            if (field.value != undefined) 
                value = await field.value(value, this.values, []);

            this.values[field.name] = value;

            if (this.build.fields[this.field + 1] == undefined) 
                this.messageCollector.stop("fieldEnd");
            else {
                this.field += 1;

                await this.message.edit(await this.generateHelpEmbed(this.build.fields[this.field]));
                await this.refreshReactions();
            }
        }
    }

    async generateEndEmbed(reason) {
        let description = "";

        switch (reason) {
        case "forced-builder-exist": 
            description += Translation.translate("builder.end.exist");
            break;
        case "forced":
            description += Translation.translate("builder.end");
            break;
        case "fieldEnd":
            description += Translation.translate("builder." + this.name + ".ok");
            break;
        }

        if(this.build.member == undefined) 
            await this.build.channel.guild.fetchMember(this.build.user).then(member => { 
                this.build.member = member;
            });

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("builder." + this.name + ".title"))
            .setDescription(description)
            .setColor(Config.getColor("SUCCESS"))
            .setFooter(this.build.member.displayName, this.build.user.avatarURL);

        return embed;
    }

    async generateHelpEmbed(field, error) {
        const fieldName = field.name;
        let description = "";

        description += Translation.translate("builder." + this.name + "." + fieldName + ".title") + "\n\n";
        description += Translation.translate("builder." + this.name + "." + fieldName + ".help") + "\n";

        if (Array.isArray(field.example)) {
            const list = [];

            field.example.forEach(example => {
                list.push("`" + example + "`");
            });

            description += Translation.translate("builder.example", list.join(" / "));
        } else
            description += Translation.translate("builder.example", "`" + field.example + "`");

        description += "\n\n" + Translation.translate("builder.stop", this.stopWord);

        if(this.build.member == undefined) 
            await this.build.channel.guild.fetchMember(this.build.user).then(member => { 
                this.build.member = member;
            });

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("builder." + this.name + ".title"))
            .setDescription(description)
            .setColor(Config.getColor("SUCCESS"))
            .setFooter(this.build.member.displayName, this.build.user.avatarURL);

        if (error != undefined && error != true) {
            let errorMessage = "";

            if (Array.isArray(error))
                errorMessage = Translation.translate(error[0], error[1]);
            else
                errorMessage = Translation.translate(error);

            embed.addField(Translation.translate("builder.error"), errorMessage);
        }

        return embed;
    }

}

module.exports = CommandBuilder;