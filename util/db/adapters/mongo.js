const mongoose = require('mongoose');
const config = require('config');
const util = require('util');

const mongo = {
    schema: 
        new mongoose.Schema({ 
            id: String,
            username: String,
            verified: Boolean,
            followers: {
                lastUpdated: String,
                list:[
                    {
                        name: String,
                        id: String,
                        verified: Boolean,
                        username: String,
                        public_metrics: {
                            followers_count: Number,
                            following_count: Number,
                            tweet_count: Number,
                            listed_count: Number
                        }
                    }
                ]
            },
            tweets: {
                lastUpdated: String,
                list: [
                    {
                        id: String,
                        text: String,
                        mentions: [
                            {
                                name: String,
                                id: String,
                                verified: Boolean,
                                username: String,
                                public_metrics: {
                                    followers_count: Number,
                                    following_count: Number,
                                    tweet_count: Number,
                                    listed_count: Number
                                }
                            }
                        ]
                    }
                ]
            }
        
        }, { collection: "twitter" }),
    log: (file,msg) => console.error("[LOG] "+file+": ",util.inspect(msg, false, null, true))
}

mongoose.connection.on('error', () => { 
    mongo.log(__filename, "db connection failed, execution halted");
    process.exit(1); 
});

mongoose.connection.once('open', () => { 
    mongo.log(__filename, "open event fired, connected to mongodb");
});

module.exports = { 
    async connect() {
        let mongo_connections = []; 
    
        for(db of config.get("app.dbs")) {
            if(db.type == 'mongodb') { 
                mongo_connections.push(db);
            }
        }
    
        mongo_connections.sort((a, b) => {
            if( typeof(a.priority) == 'string' && a.priority === 'default' &&  typeof(b.priority) == 'number' ) return -1;
            if( typeof(a.priority) == 'number' &&  typeof(b.priority) == 'number' ) {
                return (a.priority > b.priority) ?  -1 : ((a.priority < b.priority) ? 1 : 0);
            }
        });
    
        mongo.log(__filename, mongo_connections);
    
        const defaultDB = process.env[Object.getOwnPropertyNames(process.env).filter(p => p.startsWith('MONGODB_URL')).sort()[0]] + ':'+ mongo_connections[0].port +'/';
        await mongoose.connect(defaultDB, {'dbName': mongo_connections[0].target}).catch(error => mongo.log(__filename, error));
    },

    async saveTweets(toBeStored) {
        if(typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        const Twitter = await mongoose.connection.model('Twitter',mongo.schema);
        const res = await Twitter.findOne({id: toBeStored.id}).catch(error => mongo.log(__filename, error));
        if(res !== undefined && res !== null) {
            mongo.log(__filename, "user("+ res.username +") already stored, updating");
            const output = await Twitter.updateOne({id: toBeStored.id}, {verified: toBeStored.verified, lastUpdated: toBeStored.lastUpdated, tweets: toBeStored.tweets}).catch(error => mongo.log(__filename, error));
            mongo.log(__filename, "user tweets updated"); 
            mongo.log(__filename, "acknowledged: " + output.acknowledged); 
        } else {
            mongo.log(__filename, "user("+ toBeStored.username +") not previously stored, creating");
            const output = await Twitter.create(toBeStored).catch(error => mongo.log(__filename, error));
            mongo.log(__filename, "user created"); 
            mongo.log(__filename, "stored with id: " + output._id);
        }
    },

    async saveFollowers(toBeStored) {
        if(typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        const Twitter = await mongoose.connection.model('Twitter',mongo.schema);
        const res = await Twitter.findOne({id: toBeStored.id}).catch(error => mongo.log(__filename, error));
        if(res !== undefined && res !== null) {
            mongo.log(__filename, "user("+ res.username +") already stored, updating");
            const output = await Twitter.updateOne({id: toBeStored.id}, {verified: toBeStored.verified, followers: toBeStored.followers}).catch(error => mongo.log(__filename, error));
            mongo.log(__filename, "user followers updated"); 
            mongo.log(__filename, "acknowledged: " + output.acknowledged); 
        } else {
            mongo.log(__filename, "user("+ res.username +") not previously stored, creating");
            const output = await Twitter.create(toBeStored).catch(error => mongo.log(__filename, error));
            mongo.log(__filename, "user created"); 
            mongo.log(__filename, "stored with id: " + output._id);
        }
        mongo.log(__filename, "getting sorted followers list ready");
        if(toBeStored.followers !== undefined) {
            let followers = new Map();
            if(res.followers.list !== undefined && res.followers.list.length > 0) {
                for(follower of res.followers.list) {
                    followers.set(follower.username, follower.public_metrics.followers_count);
                }
            }
            if(followers.size > 0) { 
                let result = Array.from(followers, ([username, userFollowers]) => ({username, userFollowers}))
                return result.sort((a, b) => { return (a.userFollowers > b.userFollowers) ?  -1 : ((a.userFollowers < b.userFollowers) ? 1 : 0); }).slice(0,19);
            }  
            return [];               
        } else throw new Error("followers list was empty");
    },

    async getMentions(target) {
        if(typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const Twitter = await mongoose.connection.model('Twitter',mongo.schema);

        const res = await Twitter.findOne({username: target}).catch(error => mongo.log(__filename, error));
        mongo.log(__filename, "getting sorted mentions list ready");
        if(res !== undefined && res !== null) {
            let mentions = new Map();
            if(res.tweets !== undefined) {
                for(tweet of res.tweets.list) { 
                    if(tweet.mentions !== undefined && tweet.mentions.length > 0) {
                        for(mention of tweet.mentions) {
                            if(mentions.has(mention.username)) mentions.set(mention.username, (mentions.get(mention.username) + 1));
                            else mentions.set(mention.username, 1);
                        }
                    }
                }
            }
            if(mentions.size > 0) { 
                let result = Array.from(mentions, ([username, occurrence]) => ({username, occurrence}));
                return result.sort((a, b) => { return (a.occurrence > b.occurrence) ?  -1 : ((a.occurrence < b.occurrence) ? 1 : 0); }).slice(0,19);
            } 
            return [];
        } else throw new Error("mentions list was empty");
    },

    async getFollowers(target) {
        if(typeof(target) !== 'string') throw new Error("passed params type not matching required types of data");
        const Twitter = await mongoose.connection.model('Twitter',mongo.schema);

        const res = await Twitter.findOne({username: target}).catch(error => mongo.log(__filename, error));
        mongo.log(__filename, "getting sorted followers list ready");
        if(res !== undefined && res !== null) {
            let followers = new Map();
            if(res.followers !== undefined) {
                if(res.followers.list !== undefined && res.followers.list.length > 0) {
                    for(follower of res.followers.list) {
                        followers.set(follower.username, follower.public_metrics.followers_count);
                    }
                }

                if(followers.size > 0) { 
                    let result = Array.from(followers, ([username, userFollowers]) => ({username, userFollowers}))
                    return result.sort((a, b) => { return (a.userFollowers > b.userFollowers) ?  -1 : ((a.userFollowers < b.userFollowers) ? 1 : 0); }).slice(0,19);
                }  
                return [];               
            } else throw new Error("followers list was empty");
        }
    }

};
