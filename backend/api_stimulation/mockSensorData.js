const EventEmitter = require('events');

class SensorDataEmitter extends EventEmitter {
    generateData() {
        setInterval(() => {
            const data = {
                temperature: (Math.random() * 40).toFixed(2),
                humidity: (Math.random() * 100).toFixed(2),
                powerUsage: (Math.random() * 1000).toFixed(2),
                timestamp: new Date()
            };
            this.emit('data', data);
        }, 1000);
    }
}

const sensorDataEmitter = new SensorDataEmitter();
sensorDataEmitter.generateData();

module.exports = sensorDataEmitter;
