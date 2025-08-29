import React, {useEffect, useState} from 'react';
import {Text, View, Button, FlatList, StyleSheet, SafeAreaView, PermissionsAndroid, Platform} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';

const manager = new BleManager();

async function ensureBlePermissions() {
  if (Platform.OS !== 'android') return;

  if (Platform.Version >= 31) {
    await PermissionsAndroid.requestMultiple([
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION', // still needed by some OEMs for scans
    ]);
  } else {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
  }
}

export default function App() {
  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [scanning, setScanning] = useState(false);
  const [bleState, setBleState] = useState('Unknown');

  useEffect(() => {
    ensureBlePermissions();
    const sub = manager.onStateChange((s) => {
      setBleState(s);
      if (s === 'PoweredOn') console.log('BLE ready');
    }, true);
    return () => { sub.remove(); manager.destroy(); };
  }, []);

  const startScan = async () => {
    if (scanning) return;
    
    // Ensure permissions before scanning
    await ensureBlePermissions();
    
    setScanning(true);
    setDevices({});
    console.log('Starting BLE scan...');
    
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) { 
        console.warn('Scan error:', error); 
        setScanning(false); 
        return; 
      }
      if (device?.name) {
        console.log('Found device:', device.name, device.id);
        setDevices(d => ({...d, [device.id]: device}));
      }
    });
    
    setTimeout(() => { 
      console.log('Stopping scan');
      manager.stopDeviceScan(); 
      setScanning(false); 
    }, 12000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      console.log('Connecting to:', device.name);
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      const services = await connectedDevice.services();
      console.log('Services found:', services.length);
      
      for (const service of services) {
        console.log('Service UUID:', service.uuid);
        if (service.uuid.toLowerCase().includes('180d')) {
          console.log('Found Heart Rate Service!');
        }
        if (service.uuid.toLowerCase().includes('180f')) {
          console.log('Found Battery Service!');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VitalWatch BLE Test</Text>
        <Text style={styles.subtitle}>Bluetooth State: {bleState}</Text>
      </View>
      
      <View style={styles.content}>
        <Button 
          title={scanning ? 'Scanning…' : 'Scan for BLE Devices'} 
          onPress={startScan} 
          disabled={bleState !== 'PoweredOn'}
        />
        
        <Text style={styles.deviceCount}>
          Found {Object.keys(devices).length} devices
        </Text>
        
        <FlatList
          data={Object.values(devices)}
          keyExtractor={d => d.id}
          renderItem={({item}) => (
            <View style={styles.deviceItem}>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceId}>ID: {item.id}</Text>
              <Text style={styles.deviceRssi}>RSSI: {item.rssi} dBm</Text>
              <Button 
                title="Connect" 
                onPress={() => connectToDevice(item)}
              />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  deviceCount: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
});
