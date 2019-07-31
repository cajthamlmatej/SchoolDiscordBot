const config = require('config');
        
class Config {

    validate() {
        if(process.env.NODE_ENV == undefined)
            throw new Error("You are using default node enviroment. Please read README.md, change config and node enviroment.");

        this.getRequiredPaths().forEach(path => {
            if(!config.has(path))
                throw new Error("Path " + path + " is required in config.");
        });
    }

    getRequiredPaths() {
        return [
            "bot.token",
            "bot.prefix"
        ];
    }
}

const conf = new Config();

module.exports = conf;
