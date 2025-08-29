import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BluetoothService, DeviceData } from '../services/BluetoothService';

interface DeviceScannerProps {
  bluetoothService: BluetoothService;
}

export default function DeviceScanner({ bluetoothService }: DeviceScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<DeviceData[]>([]);

  const startScan = async () => {
    if (isScanning) return;

    setIsScanning(true);
    setDevices([]);

    try {
      await bluetoothService.scanForDevices((device) => {
        setDevices(prevDevices => {
          const exists = prevDevices.find(d => d.id === device.id);
          if (!exists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      });
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan Error', 'Failed to scan for devices. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      const deviceData = await bluetoothService.connectToDevice(deviceId);
      if (deviceData) {
        setConnectedDevices(prev => {
          const exists = prev.find(d => d.id === deviceId);
          if (!exists) {
            return [...prev, deviceData];
          }
          return prev.map(d => d.id === deviceId ? deviceData : d);
        });

        // Start monitoring for real-time data
        bluetoothService.monitorDevice(deviceId, (updates) => {
          setConnectedDevices(prev => 
            prev.map(d => d.id === deviceId ? { ...d, ...updates } : d)
          );
        });

        Alert.alert('Connected', `Successfully connected to ${deviceData.name}`);
      } else {
        Alert.alert('Connection Failed', 'Unable to connect to device');
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect to device');
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    try {
      await bluetoothService.disconnectDevice(deviceId);
      setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
      Alert.alert('Disconnected', 'Device disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      Alert.alert('Disconnect Error', 'Failed to disconnect device');
    }
  };

  const renderDevice = ({ item }: { item: DeviceData }) => {
    const isConnected = connectedDevices.find(d => d.id === item.id);
    
    return (
      <View style={styles.deviceItem}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceDetails}>
            {item.services.length} services • {item.rssi ? `${item.rssi} dBm` : 'Unknown signal'}
          </Text>
          
          {isConnected && (
            <View style={styles.liveData}>
              {isConnected.heartRate && (
                <Text style={styles.dataText}>♥ {isConnected.heartRate} BPM</Text>
              )}
              {isConnected.batteryLevel !== undefined && (
                <Text style={styles.dataText}>🔋 {isConnected.batteryLevel}%</Text>
              )}
              {isConnected.deviceInfo && (
                <Text style={styles.dataText}>📱 {isConnected.deviceInfo}</Text>
              )}
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.actionButton, isConnected ? styles.disconnectButton : styles.connectButton]}
          onPress={() => isConnected ? disconnectDevice(item.id) : connectToDevice(item.id)}
        >
          <Text style={styles.actionButtonText}>
            {isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Devices</Text>
        <Text style={styles.subtitle}>
          This will show real devices paired to your phone that support health monitoring
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
        onPress={startScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.scanButtonText}>🔍 Scan for Health Devices</Text>
        )}
      </TouchableOpacity>

      {connectedDevices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Devices ({connectedDevices.length})</Text>
          <FlatList
            data={connectedDevices}
            renderItem={renderDevice}
            keyExtractor={(item) => `connected-${item.id}`}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {devices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Devices ({devices.length})</Text>
          <FlatList
            data={devices.filter(d => !connectedDevices.find(cd => cd.id === d.id))}
            renderItem={renderDevice}
            keyExtractor={(item) => `available-${item.id}`}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {!isScanning && devices.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Devices Found</Text>
          <Text style={styles.emptyStateText}>
            Make sure your fitness devices are powered on and in range.{'\n\n'}
            Supported devices: Apple Watch, Fitbit, Garmin, Samsung Galaxy Watch, Polar, Suunto, and more.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  deviceDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  liveData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#10b981',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});