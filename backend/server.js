const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const bodyParser = require('body-parser');
const sensorDataEmitter = require('./api_stimulation/mockSensorData');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (token) {
        jwt.verify(token, 'SecretKey001', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (roles.length && !roles.includes(req.user.role)) {
            return res.sendStatus(403);
        }
        next();
    };
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userData = [{
        id : 1,
        name: "Surya",
        password: "password123",
        role: 'admin'
    }];
    const user = await userData.filter((obj) => {
        return obj.name == username;
    });
    // bcrypt.compareSync(password, user.password)
    if (user.length == 1 && user[0].password == password) {
        const accessToken = jwt.sign({ username: user.id}, 'Secret000');
        const resBody = {accessToken , role: user[0].role }
        res.json(resBody);
    } else {
        res.send('Username or password incorrect');
    }
});

app.get('/admin', [authenticateJWT, authorize(['admin'])], (req, res) => {
    res.send('Admin content');
});

app.get('/user', authenticateJWT, (req, res) => {
    res.send('User content');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    console.log('Client connected');
    sensorDataEmitter.on('data', (data) => {
        socket.emit('sensorData', data);
    });
    socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(3007, () => console.log('Server started on port 3007'));

let sensorData = [];

sensorDataEmitter.on('data', (data) => {
    sensorData.push(data);
    if (sensorData.length > 100) {
        sensorData.shift();  // Keep only the latest 100 data points
    }
});

app.get('/api/sensor-data', (req, res) => {
    res.json(sensorData);
});

const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

const schema = buildSchema(`
    type SensorData {
        temperature: String
        humidity: String
        powerUsage: String
        timestamp: String
    }
    type Query {
        sensorData: [SensorData]
    }
`);

const root = {
    sensorData: () => sensorData,
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
