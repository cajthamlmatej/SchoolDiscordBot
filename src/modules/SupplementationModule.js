const Module = require("./Module");
const http = require("https");
const Translation = require("../Translation");
const jsdom = require("jsdom");
const Discord = require("discord.js");
const { JSDOM } = jsdom;
const moment = require("moment");
const Config = require("../Config");
const logger = require("../Logger");

const supplementationRepository = require("../database/Database").getRepository("supplementation");

class SupplementationModule extends Module {

    getName() {
        return "supplementationmodule";
    }

    init(bot) {
        this.webOptions = {
            host: "ssps.cz",
            path: "/student/",
            protocol: "https:"
        };

        this.client = bot.client;
        this.supplementationConfig = Config.get("modules.supplementation");
        this.channel = Config.get("channels.supplementation");

        this.tick();
        this.interval = setInterval(() => this.tick(), this.supplementationConfig.refresh);
    }

    uninit() {
        clearTimeout(this.interval);
    }

    async tick() {
        this.lastCheck = moment();
        const request = http.request(this.webOptions, async (res) => {
            let data = "";
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", async () => {
                const dom = new JSDOM(data, {
                    url: "https://ssps.cz/student/",
                    referrer: "https://ssps.cz/student/",
                    contentType: "text/html",
                    includeNodeLocations: true,
                    storageQuota: 10000000
                });

                const days = {};
                const htmlDays = dom.window.document.querySelectorAll(".nav.nav-tabs")[0].children;
                Object.values(htmlDays).forEach(htmlDay => {
                    const link = htmlDay.querySelectorAll("a")[0];
                    days[link.textContent.trim()] = link.getAttribute("href");
                });

                const supples = {};
                Object.keys(days).forEach(dayName => {
                    const htmlObject = dom.window.document.querySelectorAll(days[dayName])[0];

                    supples[dayName] = [];

                    Object.values(htmlObject.querySelectorAll(".message-content")[0].children).forEach(item => {
                        if (item.children.length > 1) 
                            Object.values(item.children).forEach(subItem => {
                                supples[dayName].push(subItem.textContent.trim());
                            });
                        else 
                            supples[dayName].push(item.textContent.trim());
                        
                    });
                });

                const channel = this.client.channels.find(c => c.id == this.channel);
                await this.asyncForEach(Object.keys(supples), async (dayName) => {
                    let containsHighlight = false;
                    const supplesList = supples[dayName];
                    let suppleString = "";

                    supplesList.forEach(supple => {
                        let includes = false;

                        this.supplementationConfig.highlights.forEach(highlight => {
                            if (supple.includes(highlight)) 
                                includes = true;
                            
                        });

                        if (includes) {
                            suppleString += "**" + supple + "**\n";
                            containsHighlight = true;
                            return;
                        }
                        suppleString += supple + "\n";
                    });

                    suppleString = suppleString.replace(/^\s+|\s+$/g, "");

                    Object.keys(this.supplementationConfig.replace).forEach(from => {
                        const regex = new RegExp(from, "g");

                        suppleString = suppleString.replace(regex, this.supplementationConfig.replace[from]);
                    });

                    const embed = new Discord.RichEmbed()
                        .setTitle("👓 | " + Translation.translate("module.supplementation.new") + " " + dayName)
                        .setDescription(suppleString)
                        .setColor(Config.getColor("SUCCESS"));

                    const supplementationEntity = await supplementationRepository.getSupplementationByDay(dayName);
                    if(supplementationEntity != null) 
                        channel.fetchMessage(supplementationEntity.message).then(async (message) => {
                            if (message.embeds[0].description !== suppleString) 
                                supplementationEntity.text = suppleString;
                            await supplementationEntity.save();

                            message.edit(containsHighlight == true ? "@everyone" : "", embed).catch(error => {
                                logger.error("Error while editing supplementation message. Message is probably above 2048 char limit.");
                            });
                        });
                    else 
                        channel.send(containsHighlight == true ? "@everyone" : "", embed).then(async (message) => {
                            await supplementationRepository.insert({name: dayName, message: message.id, text: suppleString});
                        }).catch(error => {
                            logger.error("Error while editing supplementation message. Message is probably above 2048 char limit.");
                        }); 
                });
                
                await this.asyncForEach(await supplementationRepository.getSupplementations(), async (supplementation) => {
                    channel.fetchMessage(supplementation.message).then(async (message) => {
                        if (supples[supplementation.name] != undefined) {
                            if (!message.pinned) 
                                message.pin();
                            
                        } else {
                            if (message.pinned) 
                                message.unpin();

                            logger.info("Archiving supplementation for day " + supplementation.name);

                            await supplementationRepository.archiveSupplementation(supplementation.name);
                        }
                    });
                });
            });
        });
        request.on("error", function (e) {
            logger.error(e.message);
        });
        request.end();
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) 
            await callback(array[index], index, array);
        
    }

    refresh(channel) {
        this.tick();

        const embed = new Discord.RichEmbed()
            .setTitle("👓 | " + Translation.translate("module.supplementation.refreshed.title"))
            .setDescription(Translation.translate("module.supplementation.refreshed"))
            .setColor(Config.getColor("SUCCESS"));

        channel.send(embed);
    }

    event(name, args) {
        if (name != "message")
            return;

        const message = args.message;

        if (message.channel.id != this.channel)
            return;

        if (message.type != "PINS_ADD")
            return;

        message.delete();
    }

}

module.exports = SupplementationModule;