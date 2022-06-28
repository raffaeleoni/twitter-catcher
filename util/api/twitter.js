const {TwitterApi} = require("twitter-api-v2");
const util = require('util');
const { getFollowers } = require("./twitter/storage.twitter");

const twitter = 
    {
        clientV2: new TwitterApi(process.env.API_KEY).readOnly.v2,
        clientV1: new TwitterApi(process.env.API_KEY).readOnly.v1,
        fetch: require("./twitter/fetch.twitter"),
        storage: require("./twitter/storage.twitter"),
        log: (file,msg) => console.error("[LOG] "+file+": ",util.inspect(msg, false, null, true))
    };

module.exports = {
    async downloadTweets(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch timeline of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            process.exit(1);
        }

        twitter.log(__filename, 'fetching user('+ target +')\'s timeline');
        let tweets = await twitter.fetch.fetchTweets(twitter.clientV2, twitter.log, target).catch(error => twitter.log(__filename, error));
        twitter.log(__filename, tweets);
        if(tweets === undefined || typeof(tweets) !== 'object') { twitter.log(__filename, "couldn't retreive tweets, execution halted"); process.exit(1); }
        await twitter.storage.saveTweets(twitter.log, tweets).catch(error => twitter.log(__filename, error));     
        process.exit(0);   
    },

    async getMentions(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch mentions of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            process.exit(1);
        }
        twitter.log(__filename, 'fetching user('+ target +')\'s mentioned accounts from stored tweets');
        let storedMentions = await twitter.storage.getMentions(twitter.log, target).catch(error => twitter.log(__filename, error));
        if(storedMentions === undefined || typeof(storedMentions) !== 'object') { twitter.log(__filename, "couldn't retreive stored mentions, execution halted"); process.exit(1); }
        console.table(storedMentions);
        process.exit(0);  
    },

    async downloadFollowers(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch followers of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            process.exit(1);
        }
        twitter.log(__filename, 'fetching user('+ target +')\'s followers and printing out the most followed ones');
        let followers = await twitter.fetch.fetchFollowers(twitter.clientV2, twitter.log, target).catch(error => twitter.log(__filename, error));
        if(followers === undefined || typeof(followers) !== 'object') { twitter.log(__filename, "couldn't fetch updated followers, execution halted"); process.exit(1); }
        let storedFollowers = await twitter.storage.saveFollowers(twitter.log, followers).catch(error => twitter.log(__filename, error));
        if(storedFollowers === undefined || typeof(storedFollowers) !== 'object') { twitter.log(__filename, "couldn't retreive stored followers, execution halted"); process.exit(1); }
        console.table(storedFollowers);
        process.exit(0);
    },

    async getFollowers(target) {
        if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
            twitter.log(__filename, 'target user whom you want to fetch followers of must be specified as a String,\n written as "@USERNAME" with quotes\n');
            process.exit(1);
        }
        twitter.log(__filename, 'fetching user('+ target +')\'s followed accounts from stored ones');
        let followers = await twitter.storage.getFollowers(twitter.log, target).catch(error => twitter.log(__filename, error));
        if(followers === undefined || typeof(followers) !== 'object') { twitter.log(__filename, "couldn't retreive stored followers, execution halted"); process.exit(1); }
        console.table(followers);
        process.exit(0); 
    }
};




/** 
 * TODO: 
 *  -   implement stored.exists by id, and if yes update username (could've been changed) 
 * 
 */