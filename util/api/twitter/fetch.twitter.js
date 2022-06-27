module.exports = {
    async fetchNew(client, log, target) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        if(typeof(client) !== 'object' && typeof(log) !== 'function'  && typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const u = await client.userByUsername(target.slice(1).toLowerCase()).catch(error => log(__filename, error));
        let toBeStored = [];
        log(__filename, "targeted user lookup response");
        log(__filename, u);

        if(u !== undefined && u !== null) {
            let timeline = await client.userTimeline(u.data.id, {exclude: 'replies,retweets'}).catch(error => log(__filename, error));

            let i = 0;
            while(true) {
                for (const tweet of timeline.tweets) {
                    toBeStored.push(tweet);
                    log(__filename, {...tweet, count: ++i});
                }
                if(timeline.done) break;
                await timeline.fetchNext(); 
            }
            
            return {id: u.data.id, username: u.data.username, tweets: toBeStored};
        }

        throw new Error('couldn\'t find specified username');
    },
    async fetchExisting(client, log, target,lastStoredTweet) {
        if(client === undefined) throw new Error('twitter API instance undefined');
        if(typeof(client) !== 'object' && typeof(log) !== 'function'  && typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const u = await client.userByUsername(target.slice(1).toLowerCase()).catch(error => log(__filename, error));
        let toBeStored = [];
        log(__filename, "targeted user lookup response");
        log(__filename, u);

        if(u !== undefined && u !== null) {
            let timeline = await client.userTimeline(u.data.id, {since_id: lastStoredTweet, exclude: 'replies,retweets'}).catch(error => log(__filename, error));
    
            let i = 0;
            while(true) {
                for (const tweet of timeline.tweets) {
                    toBeStored.push(tweet);
                    log(__filename, {...tweet, count: ++i});
                }
                if(timeline.done) break;
                await timeline.fetchNext(); 
            }

            return {id: u.data.id, username: u.data.username, tweets: toBeStored};
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