const mongo = require("../../db/mongo");

module.exports = {
    exists(client, log, target) {
        return mongo.exists(target.slice(1).toLowerCase());
    }
}