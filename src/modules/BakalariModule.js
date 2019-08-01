const Module = require("./Module");
const Config = require("../Config");
const https = require("https");
const fs = require("fs");
const jsdom = require("jsdom");
const Discord = require("discord.js");
const { JSDOM } = jsdom;

class BakalariModule extends Module {

    getName() {
        return "bakalarimodule";
    }

    init(bot) {
        this.settings = Config.get("modules.bakalari");

        this.tempFile = "./temp/bakalari.json";
        this.channel = bot.client.channels.find(ch => ch.id == Config.get("channels.bakalari"));

        this.tick();
        setInterval(() => this.tick(), 120000);
    }

    tick() {
        let first = true;
        Object.keys(this.settings.members).forEach(member => {
            this.checkBakalariRSS(this.settings.members[member], first, member);

            first = false;
        });
    }

    checkBakalariRSS(values, main, member) {
        const webOptions = {
            host: values.domain,
            path: values.url
        };
        const request = https.request(webOptions, (res) => {
            let data = "";
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", () => {
                const dom = new JSDOM(data, {
                    url: this.settings.fullUrl,
                    referrer: this.settings.fullUrl,
                    contentType: "text/html",
                    includeNodeLocations: true,
                    storageQuota: 10000000
                });

                const file = this.readFile();

                dom.window.document.querySelectorAll("item").forEach(children => {
                    let title = children.querySelectorAll("title")[0].textContent.trim();
                    let description = children.querySelectorAll("description")[0].textContent.trim();
                    const guid = children.querySelectorAll("guid")[0].textContent.trim();
                    const isTask = title.includes("ÚKOL");
                    const subject = title.split(":")[0];

                    if (file[guid] != undefined)
                        return;

                    description = description.replace(/<br \/>/g, "\n");

                    if (!isTask) 
                        if (title.includes("zapsána známka:") || description.includes("zapsána známka:")) {
                            title = title.split(":")[0] + title.split(":")[1];

                            if (this.settings.subjects.ignored.includes(subject)) 
                                return;

                            if (!main && !this.settings.subjects.separated.includes(subject)) 
                                return;

                            description = description.split(":")[0] + description.split(":")[1];
                        }

                    file[guid] = { title: title, description: description, isTask: isTask };

                    this.channel.send(this.generateEmbed(isTask, title, description, this.settings.subjects.separated.includes(subject) ? values.group : undefined));
                });

                this.saveFile(file);
            });
        });
        request.on("error", function (e) {
            console.log(e.message);
        });
        request.end();
    }

    generateEmbed(isTask, title, description, group) {
        if (isTask) {
            const embed = new Discord.RichEmbed()
                .setTitle("📚 | Nový úkol ze systému Bakalářů" + (group == undefined ? "" : " pro " + group + ". skupinu"))
                .setDescription("Předmět a konec: **" + title.replace(/ÚKOL -/g, "") + "**\n\n" + description)
                .setColor(0xbadc58);

            return embed;
        } else {
            const embed = new Discord.RichEmbed()
                .setTitle("📚 | Nová informace ze systému Bakalářů" + (group == undefined ? "" : " pro " + group + ". skupinu"))
                .setDescription("Titulek: **" + title + "**\n\n" + description)
                .setColor(0xbadc58);

            return embed;
        }
    }

    readFile() {
        const file = fs.readFileSync(this.tempFile, "utf8");
        const fileContents = JSON.parse(file);

        return fileContents;
    }

    saveFile(fileContents) {
        fs.writeFileSync(this.tempFile, JSON.stringify(fileContents));
    }

    event(name, args) {
    }

}

module.exports = BakalariModule;