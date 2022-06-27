const mongoose = require('mongoose');
const config = require('config');

const mongo = {
    schema: 
        new mongoose.Schema({ 
            id: String,
            username: String,
            tweets: [
                {
                    id: String,
                    text: String
                }
            ]
        
        }, { collection: "user" }),
    log: (file,msg) => console.error("\n[LOG] "+file+": ",msg)
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

    async exists(targetUser) {
        if(typeof(targetUser) !== 'string') throw new Error("passed param type not matching required type of data");
        mongo.log(__filename, "check if user has already been stored");
        const res = await mongoose.connection.model('User',mongo.schema).findOne({username: targetUser}, error => mongo.log(__filename, error));
        if(res !== null && res !== undefined) {
            if(res.tweets !== undefined && res.tweets.length > 0) {
                return res.tweets[0].id;
            }
        }
        throw new Error("no match found for targeted user");
    },

    async append(toBeStored) {
        if(typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        const User = await mongoose.connection.model('User',mongo.schema);
        const res = await mongoose.connection.model('User',mongo.schema).findOne({username: toBeStored.id}, error => mongo.log(__filename, error));
        mongo.log(__filename, res);
        if(res !== null && res !== undefined) {
            let updatedTweets = toBeStored.tweets.concat(res.tweets);
            mongo.log(__filename, updatedTweets);
            const output = await User.replaceOne({username: toBeStored.id}, {id: toBeStored.id, username: toBeStored.username, tweets: updatedTweets}, error => mongo.log(__filename, error));
            mongo.log(__filename, "UPDATE STORED"); 
            mongo.log(__filename, output); 
        }
    },

    async add(toBeStored) {
        if(typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        const User = await mongoose.connection.model('User',mongo.schema);
        const output = await User.create(toBeStored).catch(error => mongo.log(error));
        mongo.log(__filename, "USER STORED"); 
        mongo.log(__filename, output);
    }

};
