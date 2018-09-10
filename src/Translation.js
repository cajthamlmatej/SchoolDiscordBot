const fs = require('fs');

class Translation {

    static translate(path){
        if(this.languageFile == undefined){
            console.log("Language file is not specified in Translation yet, doing so now...");
            try {
                let languageFileContents = fs.readFileSync("languages/" + this.language + ".json", "utf8");
                this.languageFile = JSON.parse(languageFileContents);
                console.log("Language file loaded.");
            } catch(e){
                console.log("Language file for lang " + this.language + " not found. Can't continue.");
                process.exit();
            }
        }

        let translation = this.languageFile[path];
        return translation == undefined ? "?_" + path : translation;
    }
     
    static setLanguage(lang){
        this.language = lang;
        this.languageFile = undefined;
    }

}

module.exports = Translation;