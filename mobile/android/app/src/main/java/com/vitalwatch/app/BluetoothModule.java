package com.vitalwatch.app;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.Promise;
import java.util.Set;

public class BluetoothModule extends ReactContextBaseJavaModule {

    public BluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BluetoothModule";
    }

    @ReactMethod
    public void getBondedDevices(Promise promise) {
        try {
            BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
                promise.reject("BLUETOOTH_NOT_AVAILABLE", "Bluetooth is not available or disabled");
                return;
            }

            Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();
            WritableArray devices = new WritableNativeArray();

            for (BluetoothDevice device : bondedDevices) {
                WritableMap deviceMap = new WritableNativeMap();
                deviceMap.putString("name", device.getName());
                deviceMap.putString("address", device.getAddress());
                deviceMap.putInt("bondState", device.getBondState());
                deviceMap.putInt("type", device.getType());
                
                // Check if it's a wearable device (like Galaxy Watch)
                int deviceClass = device.getBluetoothClass().getDeviceClass();
                deviceMap.putInt("deviceClass", deviceClass);
                
                // Add device type description
                String deviceType = "Unknown";
                switch (device.getBluetoothClass().getMajorDeviceClass()) {
                    case 0x0500: // AUDIO_VIDEO
                        if ((deviceClass & 0x0704) == 0x0704) {
                            deviceType = "Wearable Audio Device";
                        }
                        break;
                    case 0x0900: // HEALTH
                        deviceType = "Health Device";
                        break;
                }
                deviceMap.putString("deviceType", deviceType);
                
                devices.pushMap(deviceMap);
            }

            promise.resolve(devices);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to get bonded devices: " + e.getMessage());
        }
    }
}