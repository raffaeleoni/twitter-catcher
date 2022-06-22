const mongoose = require('mongoose');
const config = require('config');

const user = new mongoose.Schema({ 
    _id: mongoose.Schema.Types.ObjectId,
    followers: Array,
    tweets: [
        {
            _raw: Object,
            mentions: Array
        }
    ]

}, { collection: "tracks" });


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
    await mongoose.connect(defaultDB, {'dbName': mongo_connections[0].target}).catch(error => handleError(error));

}

mongoose.connection.on('open', () => { console.log("\n[EVENT] ./utils/db/mongo.js: open event fired\n"); });
mongoose.connection.on('error', error => handleError(error));

function handleError(error) { console.error("\n[EVENT] ./utils/db/mongo.js: error event fired\n",error); }
module.exports = { mongoose, connect };
