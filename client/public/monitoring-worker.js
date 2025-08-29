// VitalWatch Background Monitoring Worker
// This worker runs in the background to continuously monitor user safety

let isMonitoring = false;
let monitoringInterval = null;
let config = null;
let lastSensorData = null;

// Listen for messages from main thread
self.onmessage = function(event) {
  const { type, config: newConfig } = event.data;

  switch (type) {
    case 'START_MONITORING':
      config = newConfig;
      startMonitoring();
      break;
    case 'STOP_MONITORING':
      stopMonitoring();
      break;
    case 'UPDATE_CONFIG':
      config = { ...config, ...newConfig };
      break;
  }
};

function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  postMessage({ 
    type: 'MONITORING_STATUS', 
    data: { active: true, timestamp: new Date().toISOString() }
  });

  // Start continuous monitoring loop
  monitoringInterval = setInterval(() => {
    performHealthCheck();
  }, config.monitoringInterval);

  // Listen for device sensors if available
  if (typeof DeviceMotionEvent !== 'undefined') {
    setupMotionDetection();
  }

  // Monitor page visibility changes
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
}

function stopMonitoring() {
  isMonitoring = false;
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  postMessage({ 
    type: 'MONITORING_STATUS', 
    data: { active: false, timestamp: new Date().toISOString() }
  });
}

function performHealthCheck() {
  if (!isMonitoring) return;

  const timestamp = new Date().toISOString();
  
  // Simulate health monitoring (in real app, this would use actual sensor data)
  const simulatedData = generateSimulatedVitals();
  
  // Check for emergency conditions
  if (checkEmergencyConditions(simulatedData)) {
    postMessage({
      type: 'EMERGENCY_DETECTED',
      data: {
        type: 'health_anomaly',
        severity: 'high',
        details: simulatedData,
        timestamp
      }
    });
  }

  // Check for health alerts
  if (checkHealthAlerts(simulatedData)) {
    postMessage({
      type: 'HEALTH_ALERT',
      data: {
        message: 'Unusual heart rate pattern detected',
        details: simulatedData,
        timestamp
      }
    });
  }

  lastSensorData = simulatedData;
}

function generateSimulatedVitals() {
  // Simulate realistic vital signs (replace with actual sensor data)
  return {
    heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
    motion: {
      acceleration: {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: 9.8 + (Math.random() - 0.5) * 5
      }
    },
    timestamp: new Date().toISOString()
  };
}

function checkEmergencyConditions(data) {
  if (!config || !config.emergencyThresholds) return false;

  const { heartRateMin, heartRateMax, accelerationThreshold } = config.emergencyThresholds;
  
  // Check heart rate
  if (data.heartRate < heartRateMin || data.heartRate > heartRateMax) {
    return true;
  }

  // Check for sudden acceleration (fall detection)
  if (config.emergencyThresholds.fallDetectionEnabled) {
    const totalAcceleration = Math.sqrt(
      Math.pow(data.motion.acceleration.x, 2) +
      Math.pow(data.motion.acceleration.y, 2) +
      Math.pow(data.motion.acceleration.z, 2)
    );
    
    if (totalAcceleration > accelerationThreshold) {
      return true;
    }
  }

  return false;
}

function checkHealthAlerts(data) {
  if (!lastSensorData) return false;

  // Check for rapid heart rate changes
  const heartRateChange = Math.abs(data.heartRate - lastSensorData.heartRate);
  if (heartRateChange > 30) {
    return true;
  }

  return false;
}

function setupMotionDetection() {
  // This would set up actual device motion event listeners
  // For now, we simulate motion detection in the monitoring loop
  console.log('Motion detection setup for background monitoring');
}

function handleVisibilityChange() {
  // Adjust monitoring frequency based on app visibility
  if (document.hidden) {
    // App is in background - continue monitoring but maybe reduce frequency
    console.log('App backgrounded - continuing monitoring');
  } else {
    // App is active - can increase monitoring frequency
    console.log('App active - full monitoring');
  }
}

// Keep the worker alive
self.addEventListener('install', (event) => {
  console.log('Monitoring worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Monitoring worker activated');
  event.waitUntil(self.clients.claim());
});