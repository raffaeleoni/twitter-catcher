console.log("args passed", process.argv.splice(2), "\n\n", process.env.NODE_ENV, process.env.API_KEY );
const mongo = require("../util/db/mongo");
const twitter = require("../util/api/twitter");


mongo.connect();
twitter.downloadTweets('@raffaeleoni');