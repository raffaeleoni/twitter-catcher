const {TwitterApi} = require("twitter-api-v2");

const twitter = 
    {
        client: new TwitterApi(process.env.API_KEY).readOnly.v2,
        fetch: require("./twitter/fetch.twitter"),
        stored: require("./twitter/check.twitter"),
        log: msg => console.error("\n[LOG] ./utils/api/twitter.js: ",msg)
    };

async function downloadTweets(target) {
    if(!typeof(target) === 'string' || (typeof(target) === 'string' && !target.startsWith('@'))) {
        twitter.log('target user whom you want to fetch timeline of must be specified as a String,\n written as "@USERNAME" with quotes\n');
        return;
    }
    const lastStoredTweet = await twitter.stored.exists(twitter.client, twitter.log, target);
    if(lastStoredTweet !== null) {
        twitter.log('user('+ target +') previously stored, appending latest tweets');
        await twitter.fetch.fetchExisting(twitter.client, twitter.log, target, lastStoredTweet).catch(error => {twitter.log(error)});
    } else {
        twitter.log('user('+ target +')\'s timeline was not previously stored');
        await twitter.fetch.fetchNew(twitter.client, twitter.log, target).catch(error => {twitter.log(error)});
    }
}

module.exports = { downloadTweets };

/** 
 * TODO: 
 *  -   implement stored.exists by id, and if yes update username (could've been changed) 
 * 
 */