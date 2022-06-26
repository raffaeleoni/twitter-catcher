const mongo = require("../../db/mongo");

module.exports = {
    async fetchNew(client, log, target) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        const u = await client.userByUsername(target.slice(1).toLowerCase()).catch(error => handleError(error));
        let toBeStored = [];
        log(u);

        if(u !== undefined && u !== null) {
            let timeline = await client.userTimeline(u.data.id, {exclude: 'replies,retweets'});

            let i = 0;
            while(true) {
                for (const tweet of timeline.tweets) {
                    toBeStored.push(tweet);
                    log({...tweet, count: ++i});
                }
                if(timeline.done) break;
                await timeline.fetchNext(); 
            }
            
            mongo.append(target,toBeStored);
            return;
        }

        throw new Error('couldn\'t find specified username');
    },
    async fetchExisting(client, log, target,lastStoredTweet) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        const u = await client.userByUsername(target.slice(1).toLowerCase()).catch(error => handleError(error));
        let toBeStored = [];
        log(u);

        if(u !== undefined && u !== null) {
            let timeline = await client.userTimeline(u.data.id, {since_id: lastStoredTweet,exclude: 'replies,retweets'});
    
            let i = 0;
            while(true) {
                for (const tweet of timeline.tweets) {
                    toBeStored.push(tweet);
                    log({...tweet, count: ++i});
                }
                if(timeline.done) break;
                await timeline.fetchNext(); 
            }
            
            mongo.append(target,toBeStored);
            return;
        }

        throw new Error('couldn\'t find specified username');
    }
};



            // let followers = await client.followers(u.data.id,{ asPaginator: true });
            // while(!followers.done){
            //     for (follower of followers.users) {
            //         console.log(follower);
            //     }     
            //     await followers.fetchNext();
            // }
            //mongo.append(target,toBeStored.reverse());