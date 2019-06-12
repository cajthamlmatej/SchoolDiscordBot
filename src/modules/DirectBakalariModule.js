const Module = require("./Module");
const https = require("https");
const fs = require("fs");
const jsdom = require("jsdom");
const Discord = require("discord.js");
const { JSDOM } = jsdom;

const bakalariDomain = "bakalari.ssps.cz";
const bakalariUrl = "/bakrss.ashx?bk=";
const bakalariFullUrl = "https://bakalari.ssps.cz/bakrss.ashx?bk=";

class DirectBakalariModule extends Module {

    getName() {
        return "directbakalarimodule";
    }

    init(bot) {
        this.bot = bot;
        this.tempFile = "./temp/directbakalari.json";

        this.tick();
        setInterval(() => this.tick(), 120000);
    }
    
    tick() {
        const file = this.readFile();

        Object.keys(file).forEach(userId => {
            this.checkRssTokenForUser(userId, file[userId]);
        });
    }

    checkRssTokenForUser(userId, data) {
        const rssToken = data["token"];
        const informations = data["informations"];
        const url = bakalariUrl + rssToken;
        const fullUrl = bakalariFullUrl + rssToken;

        const webOptions = {
            host: bakalariDomain,
            path: url
        };

        const request = https.request(webOptions, (res) => {
            let data = "";
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", () => {
                const dom = new JSDOM(data, {
                    url: fullUrl,
                    referrer: fullUrl,
                    contentType: "text/html",
                    includeNodeLocations: true,
                    storageQuota: 10000000
                });

                dom.window.document.querySelectorAll("item").forEach(children => {
                    const title = children.querySelectorAll("title")[0].textContent.trim();
                    let description = children.querySelectorAll("description")[0].textContent.trim();
                    const guid = children.querySelectorAll("guid")[0].textContent.trim();
                    const isTask = title.includes("ÚKOL");
                    const subject = title;

                    if (informations.includes(guid))
                        return;

                    if (isTask) 
                        return;
                    
                    description = description.replace(/<br \/>/g, "\n");

                    if (title.includes("zapsána známka:") || description.includes("zapsána známka:")) {
                        // title = title.split(":")[0] + title.split(":")[1];

                        description = description.split(":")[0] + description.split(":")[1];

                        informations.push(guid);

                        this.bot.client.fetchUser(userId).then( user => {
                            const embed = new Discord.RichEmbed()
                                .setTitle("📚 | Nová známka ze systému Bakalářů")
                                .setDescription("**" + title + "**\n\n" + description)
                                .setColor(0xbadc58);

                            user.send(embed);
                        });
                        
                    }
                });

                this.saveUserInformations(userId, informations);
            });
        });
        request.on("error", function (e) {
        });
        request.end();
    }

    saveUserInformations(userId, informations) {
        const file = this.readFile();

        file[userId].informations = informations;
        
        this.saveFile(file);
    }

    addRssTokenForUser(userId, rssToken) {
        const file = this.readFile();

        file[userId] = {
            token: rssToken,
            informations: []
        };

        this.saveFile(file);
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

module.exports = DirectBakalariModule;