const mongo = require("../../db/mongo");

module.exports = {
    async save(log, toBeStored) {
        if(typeof(log) !== 'function' && typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        await mongo.save(toBeStored).catch(error => log(__filename, error));
    }
}