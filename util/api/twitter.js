const {TwitterApi} = require("twitter-api-v2");

const twitter = 
    {
        client: new TwitterApi(process.env.API_KEY).readOnly.v2,
        fetch: require("./twitter/fetch.twitter"),
        storage: require("./twitter/storage.twitter"),
        log: (file,msg) => console.error("\n[LOG] "+file+": ",msg)
    };

module.exports = {
    async downloadTweets(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch timeline of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            return;
        }
        const lastStoredTweet = await twitter.storage.exists(twitter.client, twitter.log, target);
        if(lastStoredTweet !== undefined) {
            twitter.log(__filename, 'user('+ target +') previously stored, appending latest tweets');
            let user = await twitter.fetch.fetchExisting(twitter.client, twitter.log, target, lastStoredTweet).catch(error => twitter.log(__filename, error));
            if(user === undefined || typeof(user) !== 'object') { twitter.log(__filename, "couldn't retreive tweets, execution halted"); process.exit(1); }
            twitter.storage.append(twitter.log, user).catch(error => twitter.log(__filename, error));
        } else {
            twitter.log(__filename, 'user('+ target +')\'s timeline was not previously stored');
            let user = await twitter.fetch.fetchNew(twitter.client, twitter.log, target).catch(error => twitter.log(__filename, error));
            if(user === undefined || typeof(user) !== 'object') { twitter.log(__filename, "couldn't retreive tweets, execution halted"); process.exit(1); }
            twitter.storage.add(twitter.log, user).catch(error => twitter.log(__filename, error));
        }
    }
};




/** 
 * TODO: 
 *  -   implement stored.exists by id, and if yes update username (could've been changed) 
 * 
 */