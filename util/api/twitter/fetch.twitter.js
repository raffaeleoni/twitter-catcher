module.exports = {
    async fetchTweets(client, log, target) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        if(typeof(client) !== 'object' || typeof(log) !== 'function'  || typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const u = await client.userByUsername(target.slice(1).toLowerCase()).catch(error => log(__filename, error));
        let toBeStored = [];

        if(u !== undefined && u !== null) {
            let timeline = await client.userTimeline(u.data.id, {exclude: 'replies,retweets'}).catch(error => log(__filename, error));

            let i = 0;
            while(true) {
                for (const tweet of timeline.tweets) {
                    toBeStored.push(tweet);
                }
                if(timeline.done) break;
                await timeline.fetchNext(); 
            }
            
            return {id: u.data.id, username: u.data.username, followers: [], tweets: toBeStored};
        }

        throw new Error('couldn\'t find specified username');
    },
    async fetchFollowers(client, log, target) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        if(typeof(client) !== 'object' || typeof(log) !== 'function'  || typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const u = await client.userByUsername(target.slice(1).toLowerCase()).catch(error => log(__filename, error));
        console.log(u);

        if(u !== undefined && u !== null) {
            let followers = await client.followers(u.data.id,{ asPaginator: true });
            console.log(followers);
            while(true){
                for (follower of followers.users) {
                    console.log(follower);
                }    
                if(followers.done) break; 
                await followers.fetchNext();
            }
        }
    }
};
