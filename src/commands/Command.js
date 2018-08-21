class Command {

    init(client, settings, commands){
        throw new Error('You have to implement the method init!');
    }

    getName(){
        throw new Error('You have to implement the method getName!');
    }

    getHelp(){
        throw new Error('You have to implement the method getHelp!');
    }

    getUsage(){
        throw new Error('You have to implement the method getHelp!');
    }

    call(args) {
        throw new Error('You have to implement the method call!');
    }

}

module.exports = Command;