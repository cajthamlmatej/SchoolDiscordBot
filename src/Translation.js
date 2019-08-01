const fs = require("fs");
const logger = require("./Logger");

class Translation {

    static translate(path, ... args) {
        if (this.languageFile == undefined) {
            logger.warn("Language file is not specified in Translation.");
            logger.info("Loading language file.");

            try {
                const languageFileContents = fs.readFileSync("languages/" + this.language + ".json", "utf8");
                this.languageFile = JSON.parse(languageFileContents);
                logger.info("Language file loaded.");
            } catch (e) {
                logger.error("Language file for lang " + this.language +" not found. Please create file \"/lang/" + this.language + ".json\" with coresponding layout.");
                logger.error("Bot cant continue without language file loaded. Exitting now.");
                process.exit();
            }
        }

        let translation = this.languageFile[path];

        if (translation == undefined) {
            logger.warn("Translation path " + path + " not found in language file. Using \"" + "t?_" + path + "\"");
            return "t?_" + path;
        }

        let counter = 0;
        args.forEach(arg => {
            translation = translation.replace(new RegExp("\\{" + counter + "\\}", "g"), arg);
            counter++;
        });
        return translation;
    }

    static isValidLanguage(language) {
        try {
            fs.readFileSync("languages/" + language + ".json", "utf8");
            return true;
        } catch (e) {
            return false;
        }
    }

    static getLanguages() {
        const languages = [];
        const languagesFiles = fs.readdirSync("languages", "utf8");

        languagesFiles.forEach(file => {
            languages.push(file.replace(".json", ""));
        });

        return languages;
    }

    static setLanguage(lang) {
        logger.info("Setting bot language to " + lang + ".");
        this.language = lang;
        this.languageFile = undefined;
    }

}

module.exports = Translation;