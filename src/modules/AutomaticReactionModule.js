const Module = require("./Module");
const Config = require("../Config");

class AutomaticReactionModule extends Module {

    getName() {
        return "automaticreactionmodule";
    }

    init(bot) {
        this.channels = Config.get("modules.automatic-reaction");
    }

    event(name, args) {
        if (name != "message")
            return;

        const message = args.message;

        // Prevent loop
        if(message.author.bot) 
            return;

        if(this.channels["global"] != undefined)
            this.checkRulesForChannel(this.channels["global"], message);
        
        if(this.channels[message.channel.id] != undefined)
            this.checkRulesForChannel(this.channels[message.channel.id], message);
    }

    async checkRulesForChannel(rules, message) {
        let promise = Promise.resolve();

        const content = message.content;
        rules.forEach(rule => {
            promise = promise.then(async () => {
                const triggers = rule.trigger;
                const reactions = rule.reactions;
    
                let triggerPassed = false;
                Object.keys(triggers).forEach(trigger => {
                    switch (trigger) {
                    case "is": {
                        const triggerValue = triggers[trigger];
    
                        if(Array.isArray(triggerValue)) {
                            triggerValue.forEach(value => {
                                if(content.toLowerCase() === value.toLowerCase())
                                    triggerPassed = true;
                            });
    
                        } else 
                            if(content.toLowerCase() === triggerValue.toLowerCase())
                                triggerPassed = true;
                            
                        break;
                    }
                    case "contains": {
                        const triggerValue = triggers[trigger];
    
                        if(Array.isArray(triggerValue)) {
                            let tempContent = content;
    
                            triggerPassed = true;
    
                            triggerValue.forEach(value => {
                                if(!tempContent.includes(value))
                                    triggerPassed = false;
    
                                tempContent = tempContent.replace(new RegExp(value, "g"), "");
                            });
    
                        } else 
                        if(content.includes(triggerValue))
                            triggerPassed = true;
                            
                        break;
                    }
                    case "contains-or": {
                        const triggerValue = triggers[trigger];
    
                        if(Array.isArray(triggerValue)) 
                            triggerValue.forEach(value => {
                                if(content.includes(value))
                                    triggerPassed = true;
                            });
                        else 
                        if(content.includes(triggerValue))
                            triggerPassed = true;
                            
                        break;
                    }
                    case "attachments": {
                        const triggerValue = triggers[trigger];

                        if (message.attachments.size >= triggerValue)
                            triggerPassed = true;
                            
                        break;
                    }
                    }
                });
    
                if(triggerPassed) 
                    reactions.forEach(reaction => {
                        const reactionType = reaction.type;
                        const reactionValue = reaction.value;
    
                        switch (reactionType) {
                        case "reaction": {
                            promise = promise.then(async () => {
                                await message.react(reactionValue);
                            });
                            break;
                        }
                        case "text-reply": {
                            promise = promise.then(async () => {
                                await message.channel.send(reactionValue);
                            });
                            break;
                        }
                        }
                    });
                
            });
        });
    }

}

module.exports = AutomaticReactionModule;