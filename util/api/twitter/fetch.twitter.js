Date.prototype.dateTimeNow = function () { 
    return this.getFullYear() +"/"+ (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ ((this.getDate() < 10)?"0":"") + this.getDate() +"@"+ ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

module.exports = {
    async fetchTweets(client, log, target) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        if(typeof(client) !== 'object' || typeof(log) !== 'function'  || typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const u = await client.userByUsername(target.slice(1).toLowerCase(), {"user.fields": "public_metrics,verified"}).catch(error => log(__filename, error));
        let toBeStored = [];

        if(u !== undefined && u !== null) {
            let timeline = await client.userTimeline(u.data.id, {exclude: 'replies,retweets', expansions: 'entities.mentions.username', max_results:100}).catch(error => log(__filename, error));
            while(true) {
                for (const tweet of timeline.tweets) {
                    let tweetMentions = [];
                    if(tweet.entities !== undefined) {
                        for(mention of tweet.entities.mentions) {
                            const mentionedUser = await client.userByUsername(mention.username,{"user.fields": "public_metrics,verified"}).catch(error => log(__filename, error));
                            if(mentionedUser !== undefined && mentionedUser !== null) {
                                tweetMentions.push({...mentionedUser.data});
                            }
                        }
                    }

                    toBeStored.push({id: tweet.id, text: tweet.text, mentions:tweetMentions});
                }
                if(timeline.done) break;
                await timeline.fetchNext(); 
            }
            
            return {id: u.data.id, username: u.data.username, verified:u.data.verified, followers: undefined, tweets: {lastUpdated: new Date().dateTimeNow(), list: toBeStored} };
        }

        throw new Error('couldn\'t find specified username');
    },
    async fetchFollowers(client, log, target) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        if(typeof(client) !== 'object' || typeof(log) !== 'function'  || typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const u = await client.userByUsername(target.slice(1).toLowerCase(), {"user.fields": "public_metrics,verified"}).catch(error => log(__filename, error));
        
        let toBeStored = [];
        if(u !== undefined && u !== null) {    
            let followers = await client.followers(u.data.id,{ asPaginator: true, max_results:100, "user.fields": "public_metrics,verified" });
            while(true){
                for (follower of followers.users) {
                    toBeStored.push(follower);
                }    
                if(followers.done) break; 
                await followers.fetchNext();
            }
        }

        return {id: u.data.id, username: u.data.username, verified:u.data.verified, followers: { lastUpdated: new Date().dateTimeNow(), list:toBeStored }, tweets: undefined};
    }
};
