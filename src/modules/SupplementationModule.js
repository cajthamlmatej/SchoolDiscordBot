const Module = require("./Module");
const http = require("https");
const Translation = require("../Translation");
const fs = require("fs");
const jsdom = require("jsdom");
const Discord = require("discord.js");
const { JSDOM } = jsdom;
const moment = require("moment");

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
        this.supplementationConfig = bot.settings.modules.supplementation;
        this.channel = bot.settings.channels.supplementation;

        this.tick();
        setInterval(() => this.tick(), this.supplementationConfig.refresh);
    }

    tick() {
        this.lastCheck = moment();
        const request = http.request(this.webOptions, (res) => {
            let data = "";
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", () => {
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

                const supplementations = fs.readFileSync("./temp/supplementations.json", "utf8");
                const supplementationsObject = JSON.parse(supplementations);

                const channel = this.client.channels.find(c => c.id == this.channel);

                let count = 0;
                Object.keys(supples).forEach(dayName => {
                    count++;

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
                        .setColor(0xbadc58);

                    if (supplementationsObject["supplementations"][dayName] != undefined) {
                        const messageId = supplementationsObject["supplementations"][dayName];

                        channel.fetchMessage(messageId).then(message => {
                            if (message.embeds[0].description !== suppleString) 
                                message.edit(containsHighlight == true ? "@everyone" : "", embed).catch(error => {
                                    console.log("Error while editing supplementation message. Message is probably above 2048 char limit.");
                                });
                            
                        });
                    } else 
                        channel.send(containsHighlight == true ? "@everyone" : "", embed).then(message => {
                            supplementationsObject["supplementations"][dayName] = message.id;

                            if (Object.keys(supples).length == count) 
                                fs.writeFileSync("./temp/supplementations.json", JSON.stringify(supplementationsObject));
                            
                        }).catch(error => {
                            console.log("Error while editing supplementation message. Message is probably above 2048 char limit.");
                        });
                    
                });

                // pins
                Object.keys(supplementationsObject["supplementations"]).forEach(day => {
                    const messageId = supplementationsObject["supplementations"][day];

                    channel.fetchMessage(messageId).then(message => {
                        if (supples[day] != undefined) {
                            if (!message.pinned) 
                                message.pin();
                            
                        } else {
                            if (message.pinned) 
                                message.unpin();

                            console.log("Removing supplementation for day " + day);

                            delete supplementationsObject["supplementations"][day];
                            fs.writeFileSync("./temp/supplementations.json", JSON.stringify(supplementationsObject));
                        }
                    });
                });
            });
        });
        request.on("error", function (e) {
            console.log(e.message);
        });
        request.end();
    }

    refresh(channel) {
        this.tick();

        const embed = new Discord.RichEmbed()
            .setTitle("👓 | " + Translation.translate("module.supplementation.refreshed.title"))
            .setDescription(Translation.translate("module.supplementation.refreshed"))
            .setColor(0xbadc58);

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