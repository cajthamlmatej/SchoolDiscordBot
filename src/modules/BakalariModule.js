const Module = require("./Module");
const Config = require("../Config");
const https = require("https");
const jsdom = require("jsdom");
const Discord = require("discord.js");
const { JSDOM } = jsdom;
const logger = require("../Logger");

const bakalariRepository = require("../database/Database").getRepository("bakalari");

class BakalariModule extends Module {

    getName() {
        return "bakalarimodule";
    }

    init(bot) {
        this.config = Config.get("modules.bakalari");

        this.channel = bot.client.channels.find(ch => ch.id == Config.get("channels.bakalari"));

        this.tick();
        this.interval = setInterval(() => this.tick(), this.config["check-time"]);
    }

    uninit(){
        clearTimeout(this.interval)
    }


    tick() {
        let first = true;
        Object.keys(this.config.members).forEach(member => {
            this.checkBakalariRSS(this.config.members[member], first, member);

            first = false;
        });
    }

    async checkBakalariRSS(values, main, member) {
        const webOptions = {
            host: values.domain,
            path: values.url
        };
        const request = https.request(webOptions, async (res) => {
            let data = "";
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", async () => {
                const dom = new JSDOM(data, {
                    url: this.config.fullUrl,
                    referrer: this.config.fullUrl,
                    contentType: "text/html",
                    includeNodeLocations: true,
                    storageQuota: 10000000
                });

                dom.window.document.querySelectorAll("item").forEach(async (children) => {
                    let title = children.querySelectorAll("title")[0].textContent.trim();
                    let description = children.querySelectorAll("description")[0].textContent.trim();
                    const guid = children.querySelectorAll("guid")[0].textContent.trim();
                    const isTask = title.includes("ÚKOL");
                    const subject = title.split(":")[0];

                    if (await bakalariRepository.doesBakalariExistsWithGuid(guid))
                        return;

                    description = description.replace(/<br \/>/g, "\n");

                    if (!isTask) 
                        if (title.includes("zapsána známka:") || description.includes("zapsána známka:")) {
                            title = title.split(":")[0] + title.split(":")[1];

                            if (this.config.subjects.ignored.includes(subject)) 
                                return;

                            if (!main && !this.config.subjects.separated.includes(subject)) 
                                return;

                            description = description.split(":")[0] + description.split(":")[1];
                        }

                    await bakalariRepository.insert({guid: guid, title: title, description: description, isTask: isTask});

                    this.channel.send(this.generateEmbed(isTask, title, description, this.config.subjects.separated.includes(subject) ? values.groups[subject] : undefined));
                });
            });
        });
        request.on("error", function (e) {
            logger.error(e.message);
        });
        request.end();
    }

    generateEmbed(isTask, title, description, group) {
        if (isTask) {
            const embed = new Discord.RichEmbed()
                .setTitle("📚 | Nový úkol ze systému Bakalářů" + (group == undefined ? "" : " pro " + group + ". skupinu"))
                .setDescription("Předmět a konec: **" + title.replace(/ÚKOL -/g, "") + "**\n\n" + description)
                .setColor(Config.getColor("SUCCESS"));

            return embed;
        } else {
            const embed = new Discord.RichEmbed()
                .setTitle("📚 | Nová informace ze systému Bakalářů" + (group == undefined ? "" : " pro " + group + ". skupinu"))
                .setDescription("Titulek: **" + title + "**\n\n" + description)
                .setColor(Config.getColor("SUCCESS"));

            return embed;
        }
    }

    event(name, args) {
    }

}

module.exports = BakalariModule;