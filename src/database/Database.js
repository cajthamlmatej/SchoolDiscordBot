const mongoose = require('mongoose');
const Config = require("../Config");
const logger = require("../Logger");
const fs = require("fs");

class Database {

    initialize() {
        logger.info("Connecting to database.");
        mongoose.connect(Config.get("database.uri"), { useNewUrlParser: true });
        
        const db = mongoose.connection;
        db.once("open", function() {
            logger.info("Connected to database.");
        });

        db.once("", function() {
            logger.error("Error while connecting to database.");
        });

        this.entites = {};
        this.repositories = {};

        logger.info("Reading directory with entities.")
        const entitesFiles = fs.readdirSync("./src/database/entites");
        entitesFiles.forEach(file => {
            const entity = require("./entites/" + file);
            
            this.entites[entity.modelName] = entity;

            logger.info(" Database entity " + entity.modelName + " loaded.");
        });

        logger.info("Reading directory with repositories.")
        const repositoriesFiles = fs.readdirSync("./src/database/repositories");
        repositoriesFiles.forEach(file => {
            const repositoryFile = require("./repositories/" + file);
            const repository = new repositoryFile();
            repository.setEntity(this.getEntity(repository.getEntity()));

            this.repositories[repository.getName()] = repository;

            logger.info(" Database repository " + repository.getName() + " loaded.");
        });
    }

    getEntity(name) {
        if(this.entites[name] == undefined)
            logger.error("Entity with name " + name + " not found.");

        return this.entites[name];
    }

    getRepository(name) {
        name += "repository";
        if(this.repositories[name] == undefined)
            logger.error("Repository with name " + name + " not found.");

        return this.repositories[name];
    }

}

const database = new Database();

module.exports = database;