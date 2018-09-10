const Module = require("./Module");
const http = require('http');
const fs = require('fs');
const jsdom = require("jsdom");
const Discord = require('discord.js');
const { JSDOM } = jsdom;

class SupplementationModule extends Module {

    getName() {
        return "supplementationmodule";
    }

    init(bot) {
        this.webOptions = {
            host: 'ssps.cz',
            path: '/student/'
        }
        
        this.client = bot.client;
        this.supplementationConfig = bot.settings.modules.supplementation;
        this.channel = bot.settings.channels.supplementation;

        this.tick();
        setInterval(() => this.tick(), this.supplementationConfig.refresh);
    }

    tick(){
        let request = http.request(this.webOptions, (res)=> {
            let data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', ()=> {
                const dom = new JSDOM(data, {
                    url: "http://ssps.cz/student/",
                    referrer: "http://ssps.cz/student/",
                    contentType: "text/html",
                    includeNodeLocations: true,
                    storageQuota: 10000000
                });
        
                let days = {};
                let htmlDays = dom.window.document.querySelectorAll(".nav.nav-tabs")[0].children;
                Object.values(htmlDays).forEach(htmlDay => {
                    let link = htmlDay.querySelectorAll("a")[0];
                    days[link.textContent.trim()] = link.getAttribute("href");
                });

                let supples = {}
                Object.keys(days).forEach(dayName => {
                    let htmlObject = dom.window.document.querySelectorAll(days[dayName])[0];

                    supples[dayName] = [];
                    
                    Object.values(htmlObject.querySelectorAll(".message-content")[0].children).forEach(item => {
                        if(item.children.length > 1){
                            Object.values(item.children).forEach(subItem => {
                                supples[dayName].push(subItem.textContent.trim());
                            });
                        } else {
                            supples[dayName].push(item.textContent.trim());
                        }
                    });
                });


                let supplementations = fs.readFileSync("./temp/supplementations.json", "utf8");
                let supplementationsObject = JSON.parse(supplementations); 
                                
                let channel = this.client.channels.find(c => c.id == this.channel);
                
                let count = 0;
                Object.keys(supples).forEach(dayName => {
                    count++;

                    let containsHighlight = false;
                    let supplesList = supples[dayName];
                    let suppleString = "";

                    supplesList.forEach(supple => {
                        let includes = false;
                        
                        this.supplementationConfig.highlights.forEach(highlight => {
                            if(supple.includes(highlight)){
                                includes = true
                            }
                        });

                        if(includes){
                            suppleString += "**" + supple + "**\n";
                            containsHighlight = true;
                            return;
                        }
                        suppleString += supple + "\n";
                    });

                    suppleString = suppleString.replace(/^\s+|\s+$/g, '');

                    const embed = new Discord.RichEmbed()
                        .setTitle("👓 | Bylo zveřejněno nové suplování na den/dny " + dayName)
                        .setDescription(suppleString)
                        .setColor(0xbadc58);

                    if(supplementationsObject["supplementations"][dayName] != undefined){
                        let messageId = supplementationsObject["supplementations"][dayName];

                        channel.fetchMessage(messageId).then(message => {
                            if(message.embeds[0].description !== suppleString){
                                message.edit(containsHighlight == true ? "@everyone" : "", embed);
                            }
                        });
                    } else {
                        channel.send(containsHighlight == true ? "@everyone" : "", embed).then(message => {
                            supplementationsObject["supplementations"][dayName] = message.id;

                            if(Object.keys(supples).length == count){
                                fs.writeFileSync("./temp/supplementations.json", JSON.stringify(supplementationsObject));
                            }
                        });
                    }
                });

                // pins
                Object.keys(supplementationsObject["supplementations"]).forEach(day =>{
                    let messageId = supplementationsObject["supplementations"][day];

                    channel.fetchMessage(messageId).then(message => {    
                        if(supples[day] != undefined){
                            if(!message.pinned){
                                message.pin();
                            }
                        } else {
                            if(message.pinned){
                                message.unpin();
                            }

                            console.log("Removing supplementation to " + day);

                            delete supplementationsObject["supplementations"][day];
                            fs.writeFileSync("./temp/supplementations.json", JSON.stringify(supplementationsObject));
                        }
                    });
                });
            });
        });
        request.on('error', function (e) {
            console.log(e.message);
        });
        request.end();
    }

    refresh(channel){
        this.tick();

        const embed = new Discord.RichEmbed()
            .setTitle("👓 | Suplování bylo aktualizováno.")
            .setDescription("Suplování bylo aktualizováno dle webových stránek školy.")
            .setColor(0xbadc58);

        channel.send(embed);
    }

    event(name, args){
        if(name != "message")
            return;

        let message = args.message;

        if(message.channel.id != this.channel)
            return;

        if(message.type != "PINS_ADD")
            return;

        message.delete();
    }

}

module.exports = SupplementationModule;