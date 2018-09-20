class CommandBuild {

    static start(user) {
        if(this.builds == undefined){
            this.builds = {};
        }

        this.builds[user] = {user: user};
    }

    static ask(user, help, fun){
        this.builds[user] = {user: user, current: {help: help, function: fu}};
    }

    static started(user){
        return this.builds[user] != undefined;
    }

    static end(user){
        delete this.builds[user];
    }

    static check(user, content){
        if(!this.started(user))
            return;
        
        let build = this.builds[user];

        if(!build.fun(user, content)){
            console.log("send help");
        } else {
            
        }
    }

}

module.exports = CommandBuild;