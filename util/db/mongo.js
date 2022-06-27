const mongoose = require('mongoose');
const config = require('config');

const mongo = {
    schema: 
        new mongoose.Schema({ 
            id: String,
            username: String,
            followers: [
                {
                    username: String,
                    followers: Number
                }
            ],
            tweets: [
                {
                    id: String,
                    text: String
                }
            ]
        
        }, { collection: "user" }),
    log: (file,msg) => console.error("[LOG] "+file+": ",msg)
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

    async save(toBeStored) {
        if(typeof(toBeStored) !== 'object') throw new Error("passed params type not matching required types of data");
        const User = await mongoose.connection.model('User',mongo.schema);
        const res = await User.findOne({id: toBeStored.id}).catch(error => mongo.log(__filename, error));
        if(res !== null && res !== undefined) {
            mongo.log(__filename, "user("+ res.username +") already stored, updating");
            const output = await User.replaceOne({id: toBeStored.id}, toBeStored);
            mongo.log(__filename, "USER UPDATED"); 
            mongo.log(__filename, "acknowledged: " + output.acknowledged); 
        } else {
            mongo.log(__filename, "user("+ res.username +") not previously stored, creating");
            const output = await User.create(toBeStored);
            mongo.log(__filename, "USER CREATED"); 
            mongo.log(__filename, "stored with id: " + output._id);
        }
    }

};
