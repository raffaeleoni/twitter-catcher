const mongoose = require('mongoose');
const config = require('config');

const user = new mongoose.Schema({ 
    followers: [
        {
            username: String,
            id: String,
            followers: Number
        }
    ],
    id: String,
    username: String,
    tweets: [
        {
            id: String,
            text: String
        }
    ]

}, { collection: "twitter" });


async function connect() {
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

    console.table(mongo_connections);

    // if multiple connections needed then use a for instead of the two lines below, now is prioritized only the one marked as zero(env)/default(config)
    const defaultDB = process.env[Object.getOwnPropertyNames(process.env).filter(p => p.startsWith('MONGODB_URL')).sort()[0]] + ':'+ mongo_connections[0].port +'/';
    await mongoose.connect(defaultDB, {'dbName': mongo_connections[0].target}).catch(error => LOG(error));

}

async function exists(targetUser) {
    if(typeof(targetUser) === 'string') {
        LOG("check if user has already been stored");
        const res = await mongoose.connection.model('User',user).findOne({id: targetUser}).exec();
        if(res !== null && res !== undefined) {
            if(res.tweets !== undefined && res.tweets.length > 0) {
                return res.tweets[0].id;
            }
        }
    }
    return null;
}

mongoose.connection.on('open', () => { LOG("open event fired, connected to mongodb"); });
mongoose.connection.on('error', error => LOG(error));

function LOG(msg) { console.error("\n[LOG] ./utils/db/mongo.js: ",msg); }
module.exports = { mongoose, connect, exists };
