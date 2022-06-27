const mongo = require("../util/db/mongo");
const twitter = require("../util/api/twitter");

mongo.connect().then(() => {
        const params = process.argv.splice(2);
        if(params.length === 2 && params[0] === 'download-tweets' && params[1].startsWith('@')){
            twitter.downloadTweets(params[1]);
        } else if(params.length === 2 && params[0] === 'get-mentions' && params[1].startsWith('@')){
            twitter.getMentions(params[1]);
        } else if(params.length === 2 && params[0] === 'download-followers' && params[1].startsWith('@')){
            twitter.downloadFollowers(params[1]);
        } else {
            console.log(
`TWITTER-CATCHER(v0.0.1) please use one of the followings commands:
    - npm run download-tweets "@TargetUser"
    - npm run get-mentions "@TargetUser"
    - npm run download-followers "@TargetUser"
quotes are mandatory
`
            );
        }
    }
);
