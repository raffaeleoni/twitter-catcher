const mongo = require("../util/db/mongo");
const twitter = require("../util/api/twitter");

mongo.connect().then(
    twitter.downloadTweets('@raffaeleoni')
);
