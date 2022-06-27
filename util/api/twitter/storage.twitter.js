const mongo = require("../../db/mongo");

module.exports = {
    async exists(client, log, target) {
        if(typeof(client) !== 'object' && typeof(log) !== 'function'  && typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const found = await mongo.exists(target.slice(1).toLowerCase()).catch(error => log(__filename, error));
        return found;
    },

    async add(log, toBeStored) {
        if(typeof(log) !== 'function' && typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        await mongo.add(toBeStored).catch(error => log(__filename, error));
    },

    async append(log, toBeStored) {
        if(typeof(log) !== 'function' && typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        await mongo.append(toBeStored).catch(error => log(__filename, error));
    }
}