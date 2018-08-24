const fs = require('fs');
const SSPSBot = require("./SSPSBot");

let settings;

console.log("School Discord Bot started");
console.log("Opening settings file");

fs.readFile('./settings/settings.json', (err, fileContents) => {
    if (err) throw err;

    console.log("Reading settings file contents.");
    settings = JSON.parse(fileContents);


    let commands = {};    
    let commandFiles = fs.readdirSync("./src/commands");

    commandFiles.forEach(file => {
        if(file == "Command.js")
            return;
        

        let commandFile = require("./commands/" + file);
        let command = new commandFile();
        
        commands[command.getName()] = command;
    });
  
    let modules = {};    
    let moduleFiles = fs.readdirSync("./src/modules");

    moduleFiles.forEach(file => {
        if(file == "Module.js")
            return;
        
        let moduleFile = require("./modules/" + file);
        let module = new moduleFile();

        modules[module.getName()] = module;
    });

    console.log("Creating instances of bot");
    bot = new SSPSBot(settings, commands, modules);
    bot.login();
});