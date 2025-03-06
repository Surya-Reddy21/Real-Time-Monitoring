const SensorDataEmitter = require('./SensorDataEmitter'); // Adjust the path as needed
jest.useFakeTimers();

describe('SensorDataEmitter', () => {
  let sensorDataEmitter;

  beforeEach(() => {
    sensorDataEmitter = new SensorDataEmitter();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should emit data event with valid data structure', () => {
    const mockCallback = jest.fn();

    // Listen for the 'data' event
    sensorDataEmitter.on('data', mockCallback);

    // Mock generateData method and manually trigger the interval
    sensorDataEmitter.generateData();
    jest.advanceTimersByTime(1000); // Simulate 1-second interval

    // Ensure the callback was called
    expect(mockCallback).toHaveBeenCalled();

    // Validate the emitted data
    const data = mockCallback.mock.calls[0][0]; // Get first call's argument
    expect(data).toHaveProperty('temperature');
    expect(data).toHaveProperty('humidity');
    expect(data).toHaveProperty('powerUsage');
    expect(data).toHaveProperty('timestamp');

    // Check data types
    expect(parseFloat(data.temperature)).not.toBeNaN();
    expect(parseFloat(data.humidity)).not.toBeNaN();
    expect(parseFloat(data.powerUsage)).not.toBeNaN();
    expect(new Date(data.timestamp).toString()).not.toBe('Invalid Date');
  });

  test('should emit data at regular intervals', () => {
    const mockCallback = jest.fn();

    // Listen for the 'data' event
    sensorDataEmitter.on('data', mockCallback);

    // Start generating data
    sensorDataEmitter.generateData();

    // Simulate multiple intervals
    jest.advanceTimersByTime(3000); // 3 seconds
    expect(mockCallback).toHaveBeenCalledTimes(3);
  });
});
