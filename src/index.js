const fs = require('fs');
const SchoolDiscordBot = require("./SchoolDiscordBot");

let settings;

console.log("School Discord Bot started, author of the bot is Matěj Cajthaml <cajthaml.matej@navarru.cz>.");
console.log("Opening and reading settings file.");

fs.readFile('./settings/settings.json', (err, fileContents) => {
    if (err) throw err;

    console.log("Reading JSON of settings file content.");
    settings = JSON.parse(fileContents);

    let commands = {};
    console.log("Reading directory with commands.");
    let commandFiles = fs.readdirSync("./src/commands");

    commandFiles.forEach(file => {
        if(file == "Command.js" || file == "SubsCommand.js")
            return;
        
        let commandFile = require("./commands/" + file);
        let command = new commandFile();
        
        commands[command.getName()] = command;
    });
  
    let modules = {};    
    console.log("Reading directory with modules.");
    let moduleFiles = fs.readdirSync("./src/modules");
    
    moduleFiles.forEach(file => {
        if(file == "Module.js")
            return;
        
        let moduleFile = require("./modules/" + file);
        let module = new moduleFile();

        modules[module.getName()] = module;
    });

    console.log("Creating instance of the School Discord Bot.");
    bot = new SchoolDiscordBot(settings, commands, modules);
    bot.login();
});