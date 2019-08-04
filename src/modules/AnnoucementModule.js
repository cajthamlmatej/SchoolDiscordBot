const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");

const annoucementRepository = require("../database/Database").getRepository("annoucement");

class AnnoucementModule extends Module {

    getName() {
        return "annoucementmodule";
    }

    init(bot) {
        this.channel = bot.client.channels.find(ch => ch.id == Config.get("channels.annoucement"));
    }

    async annoucementExist(name) {
        return await annoucementRepository.doesAnnoucementExistsWithName(name);
    }

    async addAnnoucement(member, name, title, annoucement) {
        await this.channel.send(this.generateAnnoucementEmbed({ annoucement: annoucement, title: title }, member)).then(async (message) => {
            await annoucementRepository.insert({
                name: name,
                title: title,
                annoucement: annoucement,
                message: message.id,
                author: member.user.id
            });
        });
    }

    generateAnnoucementEmbed(values, member) {
        return new Discord.RichEmbed()
            .setTitle("📢 | " + values.title)
            .setDescription(values.annoucement)
            .setFooter(member.nickname, member.user.avatarURL)
            .setColor(0xbadc58);
    }

    async deleteAnnoucement(channel, name) {
        const annoucement = await annoucementRepository.getAnnoucementByName(name, "message");

        this.channel.fetchMessage(annoucement.message).then(message => {
            message.delete();
        }).catch(error => { });

        await annoucementRepository.deleteAnnoucement(name);

        const embed = new Discord.RichEmbed()
            .setTitle("📢 | " + Translation.translate("module.annoucement.deleted"))
            .setDescription("")
            .setColor(0xbadc58);

        channel.send(embed);
    }

    async editAnnoucement(member, name, type, value) {
        const annoucement = await annoucementRepository.getAnnoucementByName(name, "message");
        const change = {};
        change[type] = value;
        
        await annoucementRepository.editAnnoucement(name, change);

        this.channel.fetchMessage(annoucement.message).then(message => {
            message.edit(this.generateAnnoucementEmbed(annoucement, member));
        }).catch(error => { });
    }

    async listAnnoucements(member) {
        const annoucements = await annoucementRepository.getAnnoucements("name title");

        let list = "";

        annoucements.forEach(annoucement => {
            list += "\n**" + annoucement.name + "** - " + annoucement.title;
        });

        if (list == "") 
            list = Translation.translate("module.annoucement.no-annoucement-exists");

        const embed = new Discord.RichEmbed()
            .setTitle("📢 | " + Translation.translate("module.annoucement.list"))
            .setDescription(list)
            .setColor(0xbadc58);

        member.user.createDM().then(dm => dm.send(embed)).catch(error => { });
    }

    event(name, args) {
    }

}

module.exports = AnnoucementModule;