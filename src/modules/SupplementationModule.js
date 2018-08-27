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
        this.supplementationHighlight = bot.settings["supplementation-highlight"];
        this.channel = bot.settings["channels"]["supplementation"];
        this.tick();
        setInterval(() => this.tick(), 1800000);
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
                    let list = htmlObject.querySelectorAll("ul")[0];

                    supples[dayName] = [];
                    Object.values(list.children).forEach(item => {
                        supples[dayName].push(item.textContent.trim());
                    });
                });


                let supplementations = fs.readFileSync("./temp/supplementations.json", "utf8");
                let supplementationsObject = JSON.parse(supplementations); 
                                
                let channel = this.client.channels.find(c => c.id == this.channel);
                
                let count = 0;
                Object.keys(supples).forEach(dayName => {
                    count++;
                    let supplesList = supples[dayName];
                    let suppleString = "";

                    supplesList.forEach(supple => {
                        if(supple.includes(this.supplementationHighlight)){
                            suppleString += "**" + supple + "**\n";
                            return;
                        }
                        suppleString += supple + "\n";
                    });

                    suppleString = suppleString.replace(/^\s+|\s+$/g, '');

                    const embed = new Discord.RichEmbed()
                        .setTitle("👓 | Bylo zveřejněno nové suplování na den/dny " + dayName)
                        .setDescription(suppleString)
                        .setColor(0x1abc9c);

                    if(supplementationsObject["supplementations"][dayName] != undefined){
                        let messageId = supplementationsObject["supplementations"][dayName];

                        channel.fetchMessage(messageId).then(message => {
                            if(message.embeds[0].description !== suppleString){
                                message.edit(embed);
                            }
                        });
                    } else {
                        channel.send(embed).then(message => {
                            supplementationsObject["supplementations"][dayName] = message.id;

                            if(Object.keys(supples).length == count){
                                fs.writeFileSync("./temp/supplementations.json", JSON.stringify(supplementationsObject));
                            }
                        });
                    }
                });
            });
        });
        request.on('error', function (e) {
            console.log(e.message);
        });
        request.end();
    }

    event(name, args){

    }

}

module.exports = SupplementationModule;