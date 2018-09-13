const fs = require('fs');

class Translation {

    static translate(path) {
        if (this.languageFile == undefined) {
            console.log("Language file is not specified in Translation yet, doing so now...");
            try {
                let languageFileContents = fs.readFileSync("languages/" + this.language + ".json", "utf8");
                this.languageFile = JSON.parse(languageFileContents);
                console.log("Language file loaded.");
            } catch (e) {
                console.log("Language file for lang " + this.language + " not found. Can't continue.");
                process.exit();
            }
        }

        let translation = this.languageFile[path];
        return translation == undefined ? "?_" + path : translation;
    }

    static languageExists(language) {
        try {
            fs.readFileSync("languages/" + language + ".json", "utf8");
            return true;
        } catch (e) {
            return false;
        }
    }

    static languageList() {
        let languages = [];
        let languagesFiles = fs.readdirSync("languages", "utf8");

        languagesFiles.forEach(file => {
            languages.push(file.replace(".json", ""));
        });

        return languages;
    }

    static setLanguage(lang) {
        this.language = lang;
        this.languageFile = undefined;
    }

}

module.exports = Translation;