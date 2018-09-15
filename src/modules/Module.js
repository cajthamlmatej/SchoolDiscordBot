class Module {

    init(client) {
        throw new Error('You have to implement the method init!');
    }

    getName() {
        throw new Error('You have to implement the method getName!');
    }

    event(name) {
        throw new Error('You have to implement the method event!');
    }

}

module.exports = Module;