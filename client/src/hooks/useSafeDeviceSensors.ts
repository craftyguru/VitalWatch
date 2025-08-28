import { useState, useEffect } from 'react';

// Real device sensor hook using phone and Bluetooth device APIs
export const useSafeDeviceSensors = () => {
  const [sensorData, setSensorData] = useState({
    accelerometer: { x: 0, y: 0, z: 0, active: false },
    gyroscope: { alpha: 0, beta: 0, gamma: 0, active: false },
    location: { lat: 0, lng: 0, accuracy: 0, active: false },
    battery: { level: 0, charging: false, active: false },
    ambient: { light: 0, active: false },
    heartRate: { bpm: 0, active: false },
    environment: {
      temperature: 0,
      humidity: 0,
      pressure: 0,
      airQuality: 0,
      noiseLevel: 0,
      active: false
    }
  });

  const [permissions, setPermissions] = useState({
    accelerometer: 'prompt' as PermissionState,
    gyroscope: 'prompt' as PermissionState,
    geolocation: 'prompt' as PermissionState,
    battery: 'prompt' as PermissionState,
    camera: 'prompt' as PermissionState
  });

  const [isConnected, setIsConnected] = useState(false);

  // Request permissions and initialize sensors
  const requestPermissions = async () => {
    try {
      // Request accelerometer and gyroscope permission
      if ('DeviceMotionEvent' in window) {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            setPermissions(prev => ({ ...prev, accelerometer: 'granted' }));
            initializeMotionSensors();
          }
        } else {
          // Android devices don't require permission request
          setPermissions(prev => ({ ...prev, accelerometer: 'granted' }));
          initializeMotionSensors();
        }
      }

      // Request geolocation permission
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissions(prev => ({ ...prev, geolocation: 'granted' }));
            initializeLocationTracking();
          },
          () => {
            setPermissions(prev => ({ ...prev, geolocation: 'denied' }));
          }
        );
      }

      // Initialize battery API
      if ('getBattery' in navigator) {
        setPermissions(prev => ({ ...prev, battery: 'granted' }));
        initializeBatteryAPI();
      }

      // Initialize ambient light sensor
      if ('AmbientLightSensor' in window) {
        initializeAmbientLight();
      }

    } catch (error) {
      console.log('Permission request failed:', error);
    }
  };

  // Initialize motion sensors (accelerometer/gyroscope)
  const initializeMotionSensors = () => {
    window.addEventListener('devicemotion', (event) => {
      const acc = event.accelerationIncludingGravity;
      const rot = event.rotationRate;
      
      setSensorData(prev => ({
        ...prev,
        accelerometer: {
          x: acc?.x || 0,
          y: acc?.y || 0,
          z: acc?.z || 0,
          active: true
        },
        gyroscope: {
          alpha: rot?.alpha || 0,
          beta: rot?.beta || 0,
          gamma: rot?.gamma || 0,
          active: true
        }
      }));
    });
  };

  // Initialize location tracking
  const initializeLocationTracking = () => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setSensorData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            active: true
          }
        }));
      },
      (error) => {
        console.log('Location tracking error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  };

  // Initialize battery API
  const initializeBatteryAPI = async () => {
    try {
      const battery = await (navigator as any).getBattery();
      setSensorData(prev => ({
        ...prev,
        battery: {
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          active: true
        }
      }));

      // Listen for battery changes
      battery.addEventListener('levelchange', () => {
        setSensorData(prev => ({
          ...prev,
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            active: true
          }
        }));
      });

      battery.addEventListener('chargingchange', () => {
        setSensorData(prev => ({
          ...prev,
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            active: true
          }
        }));
      });
    } catch (error) {
      console.log('Battery API not available:', error);
    }
  };

  // Initialize ambient light sensor
  const initializeAmbientLight = () => {
    try {
      const sensor = new (window as any).AmbientLightSensor();
      sensor.addEventListener('reading', () => {
        setSensorData(prev => ({
          ...prev,
          ambient: {
            light: sensor.illuminance || 0,
            active: true
          }
        }));
      });
      sensor.start();
    } catch (error) {
      console.log('Ambient light sensor not available:', error);
    }
  };

  // Initialize environmental sensors from connected devices (optional, user-initiated)
  const initializeEnvironmentalSensors = async () => {
    try {
      // Only try Bluetooth when user explicitly requests it
      console.log('Bluetooth environmental sensors available on user request');
    } catch (error) {
      console.log('Bluetooth device connection failed:', error);
      setIsConnected(false);
    }
  };

  // Initialize audio level monitoring for noise detection
  const initializeAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyzer = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyzer);
      analyzer.fftSize = 512;
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateNoiseLevel = () => {
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const decibels = Math.round(20 * Math.log10(average / 128));
        
        setSensorData(prev => ({
          ...prev,
          environment: {
            ...prev.environment,
            noiseLevel: Math.max(0, decibels + 60), // Normalize to positive dB scale
            active: true
          }
        }));
        
        requestAnimationFrame(updateNoiseLevel);
      };
      
      updateNoiseLevel();
    } catch (error) {
      console.log('Audio monitoring not available:', error);
    }
  };

  // Auto-initialize core sensors on mount
  useEffect(() => {
    // Only initialize non-intrusive sensors automatically
    if ('DeviceMotionEvent' in window) {
      initializeMotionSensors();
    }
    if ('getBattery' in navigator) {
      setPermissions(prev => ({ ...prev, battery: 'granted' }));
      initializeBatteryAPI();
    }
    
    // Check for ambient light sensor
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          setSensorData(prev => ({
            ...prev,
            ambient: { light: Math.round(sensor.illuminance), active: true }
          }));
        });
        sensor.start();
      } catch (error) {
        console.log('Ambient light sensor not available');
      }
    }
  }, []);

  return {
    sensorData,
    permissions,
    requestPermissions,
    isConnected
  };
};