const {TwitterApi} = require("twitter-api-v2");

const twitter = 
    {
        clientV2: new TwitterApi(process.env.API_KEY).readOnly.v2,
        clientV1: new TwitterApi(process.env.API_KEY).readOnly.v1,
        fetch: require("./twitter/fetch.twitter"),
        storage: require("./twitter/storage.twitter"),
        log: (file,msg) => console.error("[LOG] "+file+": ",msg)
    };

module.exports = {
    async downloadTweets(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch timeline of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            process.exit(1);
        }

        twitter.log(__filename, 'fetching user('+ target +')\'s timeline');
        let user = await twitter.fetch.fetchTweets(twitter.clientV2, twitter.log, target).catch(error => twitter.log(__filename, error));
        if(user === undefined || typeof(user) !== 'object') { twitter.log(__filename, "couldn't retreive tweets, execution halted"); process.exit(1); }
        twitter.storage.save(twitter.log, user).catch(error => twitter.log(__filename, error));
        
    },
    async getMentions(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch timeline of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            process.exit(1);
        }
    },
    async downloadFollowers(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch timeline of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            process.exit(1);
        }
        let followers = await twitter.fetch.fetchFollowers(twitter.clientV2, twitter.log, target).catch(error => twitter.log(__filename, error));
        if(followers === undefined || typeof(followers) !== 'object') { twitter.log(__filename, "couldn't retreive followers, execution halted"); process.exit(1); }
    }
};




/** 
 * TODO: 
 *  -   implement stored.exists by id, and if yes update username (could've been changed) 
 * 
 */