class Repository {

    setEntity(entity) {
        this.entity = entity;
    }

    getName() {
        throw new Error("You have to implement the method getName!");
    }

    getEntity() {
        throw new Error("You have to implement the method getEntity!");
    }

    insert(values) {
        const entity = new this.entity(values);

        entity.save();
        return entity;
    }
}

module.exports = Repository;