// if there would be a message broker, here will imported the connection instance then made all the consequent requests to the db node for this api
const mongo = require("../../db/adapters/mongo");

module.exports = {
    async saveTweets(log, toBeStored) {
        if(typeof(log) !== 'function' && typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        if(toBeStored.id === undefined || toBeStored.username === undefined) throw new Error("object to be stored not matching minimal requirements to be archived");
        await mongo.saveTweets(toBeStored).catch(error => log(__filename, error));
    },
    async saveFollowers(log, toBeStored) {
        if(typeof(log) !== 'function' && typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        if(toBeStored.id === undefined || toBeStored.username === undefined) throw new Error("object to be stored not matching minimal requirements to be archived");
        return await mongo.saveFollowers(toBeStored).catch(error => log(__filename, error));
    },

    async getMentions(log, target) {
        if(typeof(log) !== 'function' && typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        return await mongo.getMentions(target.slice(1).toLowerCase()).catch(error => log(__filename, error));
    },

    async getFollowers(log, target) {
        if(typeof(log) !== 'function' && typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        return await mongo.getFollowers(target.slice(1).toLowerCase()).catch(error => log(__filename, error));
    }
}