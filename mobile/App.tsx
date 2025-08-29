import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import DeviceScanner from './src/components/DeviceScanner';
import { BluetoothService } from './src/services/BluetoothService';

export default function App() {
  const [bluetoothService] = useState(() => new BluetoothService());
  const [bluetoothReady, setBluetoothReady] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    initializeApp();
    return () => {
      bluetoothService.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Request permissions for Android
      if (Platform.OS === 'android') {
        const permissionsNeeded = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const permissions = await PermissionsAndroid.requestMultiple(permissionsNeeded);
        
        const allGranted = Object.values(permissions).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'VitalWatch needs Bluetooth and location permissions to connect to your fitness devices.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        setPermissionsGranted(true);
      } else {
        setPermissionsGranted(true);
      }

      // Initialize Bluetooth
      const isReady = await bluetoothService.initialize();
      if (isReady) {
        setBluetoothReady(true);
        console.log('VitalWatch: Bluetooth ready for device scanning');
      } else {
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth to connect to your fitness devices.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Initialization Error', 'Failed to initialize VitalWatch. Please restart the app.');
    }
  };

  if (!permissionsGranted || !bluetoothReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
        <View style={styles.loadingContainer}>
          <Text style={styles.logo}>VitalWatch</Text>
          <Text style={styles.loadingText}>
            {!permissionsGranted ? 'Requesting permissions...' : 'Initializing Bluetooth...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VitalWatch</Text>
        <Text style={styles.headerSubtitle}>Real Device Monitor</Text>
      </View>

      <DeviceScanner bluetoothService={bluetoothService} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
});
