const Module = require("./Module");
const Discord = require("discord.js");
const fs = require("fs");
const Translation = require("../Translation");
const Config = require("../Config");

class AnnoucementModule extends Module {

    getName() {
        return "annoucementmodule";
    }

    init(bot) {
        this.tempFile = "./temp/annoucements.json";
        this.channel = bot.client.channels.find(ch => ch.id == Config.get("channels.annoucement"));
    }

    annoucementExist(name) {
        return this.getAnnoucement(name) != undefined;
    }

    getAnnoucement(name) {
        return this.readFile()[name];
    }

    addAnnoucement(member, name, title, annoucement) {
        const annoucements = this.readFile();

        this.channel.send(this.generateAnnoucementEmbed({ annoucement: annoucement, title: title }, member)).then(message => {
            annoucements[name] = { message: message.id, title: title, annoucement: annoucement };

            this.saveFile(annoucements);
        });
    }

    generateAnnoucementEmbed(values, member) {
        return new Discord.RichEmbed()
            .setTitle("📢 | " + values.title)
            .setDescription(values.annoucement)
            .setFooter(member.nickname, member.user.avatarURL)
            .setColor(0xbadc58);
    }

    deleteAnnoucement(channel, name) {
        const annoucement = this.getAnnoucement(name);

        this.channel.fetchMessage(annoucement.message).then(message => {
            message.delete();
        }).catch(error => { });

        const annoucements = this.readFile();
        delete annoucements[name];

        this.saveFile(annoucements);

        const embed = new Discord.RichEmbed()
            .setTitle("📢 | " + Translation.translate("module.annoucement.deleted"))
            .setDescription("")
            .setColor(0xbadc58);

        channel.send(embed);
    }

    editAnnoucement(member, name, type, value) {
        const annoucement = this.getAnnoucement(name);
        annoucement[type] = value;

        this.channel.fetchMessage(annoucement.message).then(message => {
            message.edit(this.generateAnnoucementEmbed(annoucement, member));
        }).catch(error => { });

        const annoucements = this.readFile();
        annoucements[name] = annoucement;

        this.saveFile(annoucements);
    }

    listAnnoucements(member) {
        const annoucements = this.readFile();

        let list = "";

        Object.keys(annoucements).forEach(annoucementName => {
            list += "\n**" + annoucementName + "** - " + annoucements[annoucementName].title;
        });

        if (list == "") 
            list = Translation.translate("module.annoucement.no-annoucement-exists");

        const embed = new Discord.RichEmbed()
            .setTitle("📢 | " + Translation.translate("module.annoucement.list"))
            .setDescription(list)
            .setColor(0xbadc58);

        member.user.createDM().then(dm => dm.send(embed)).catch(error => { });
    }

    readFile() {
        const file = fs.readFileSync(this.tempFile, "utf8");
        const annoucements = JSON.parse(file)["annoucements"];

        return annoucements;
    }

    saveFile(annoucements) {
        const object = { annoucements: annoucements };
        fs.writeFileSync(this.tempFile, JSON.stringify(object));
    }

    event(name, args) {
    }

}

module.exports = AnnoucementModule;