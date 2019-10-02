const Module = require("./Module");
const https = require("https");
const jsdom = require("jsdom");
const Discord = require("discord.js");
const { JSDOM } = jsdom;
const Config = require("../Config");

const directBakalariRepository = require("../database/Database").getRepository("directbakalari");

const bakalariDomain = "bakalari.ssps.cz";
const bakalariUrl = "/bakrss.ashx?bk=";
const bakalariFullUrl = "https://bakalari.ssps.cz/bakrss.ashx?bk=";

class DirectBakalariModule extends Module {

    getName() {
        return "directbakalarimodule";
    }

    init(bot) {
        this.bot = bot;

        this.tick();
        this.interval = setInterval(() => this.tick(), Config.get("modules.bakalari.check-time"));
    }

    uninit() {
        clearTimeout(this.interval);
    }
    
    async tick() {
        (await directBakalariRepository.getAllUsers()).forEach(directBakalari => {
            this.checkRssTokenForUser(directBakalari);
        });
    }

    checkRssTokenForUser(directBakalari) {
        const rssToken = directBakalari.token;
        const informations = directBakalari.informations;
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
            res.on("end", async () => {
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

                    if (informations.includes(guid))
                        return;

                    if (isTask) 
                        return;
                    
                    description = description.replace(/<br \/>/g, "\n");

                    if (title.includes("zapsána známka:") || description.includes("zapsána známka:")) {
                        description = description.split(":")[0] + description.split(":")[1];

                        informations.push(guid);

                        this.bot.client.fetchUser(directBakalari.user).then( user => {
                            const embed = new Discord.RichEmbed()
                                .setTitle("📚 | Nová známka ze systému Bakalářů")
                                .setDescription("**" + title + "**\n\n" + description)
                                .setColor(Config.getColor("SUCCESS"));

                            user.send(embed);
                        });
                    }
                });

                await directBakalari.save();
            });
        });
        request.on("error", function (e) {
        });
        request.end();
    }

    async addRssTokenForUser(userId, rssToken) {
        const user = await directBakalariRepository.getUser(userId);

        if(user != null) {
            user.token = rssToken;
            await user.save();
        } else
            await directBakalariRepository.insert({
                user: userId,
                token: rssToken,
                informations: [] 
            });
    }

    event(name, args) {
    }

}

module.exports = DirectBakalariModule;