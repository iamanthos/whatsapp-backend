// import
import express, { json } from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages';
import Pusher from 'pusher';
import cors from 'cors';


// password - EgDOWrsBY1lQo6Jq

// appConfig
const app = express();
const port = process.env.port || 8000;

var pusher = new Pusher({
    appId: '1067428',
    key: '9015a47cf5a6cc9ea611',
    secret: '6ad8d4349c57929ba88c',
    cluster: 'ap2',
    encrypted: true
  });

// middleware
app.use(express.json());
app.use(cors());

// connection
const con_url = `mongodb+srv://anthos:EgDOWrsBY1lQo6Jq@cluster0.ccthd.mongodb.net/whatsappdb?retryWrites=true&w=majority`;

mongoose.connect(con_url), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedToplogy: true
}

// logic

const db = mongoose.connection;
db.once('open', () => {
    console.log('DB connected');
    const msgCollection = db.collection("messages");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log('change happened ' + JSON.stringify(change));

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
        pusher.trigger('messages', 'inserted', {
            name: messageDetails.name,
            message: messageDetails.message,
            timestamp: messageDetails.timestamp,
            received: messageDetails.received
        });
        } else {
            console.log(`Error in pusher`);
        }
        
    })
})



// apiRoutes

app.get('/', (req, res) => res.status(200).send('Hello World!'));

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;
    
    Messages.create(dbMessage, (err, data) => {
        if(err){
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
});

app.get('/messages/sync', (req, res) => {
    const dbMessage = req.body;
    
    Messages.find((err, data) => {
        if(err){
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
});

// apiListener
app.listen(port, () => {
    console.log(`Listening on localhost: ${port}`);
});