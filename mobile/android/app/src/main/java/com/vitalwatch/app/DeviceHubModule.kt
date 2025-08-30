package com.vitalwatch.app

import android.bluetooth.*
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = DeviceHubModule.NAME)
class DeviceHubModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object { 
    const val NAME = "DeviceHub"
    const val TAG = "DeviceHubModule"
  }
  override fun getName() = NAME

  @ReactMethod
  fun getDevices(promise: Promise) {
    try {
      Log.d(TAG, "=== DeviceHub.getDevices() called ===")
      
      val mgr = reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
      val adapter = BluetoothAdapter.getDefaultAdapter()
      
      if (adapter == null) {
        Log.e(TAG, "BluetoothAdapter is null!")
        promise.reject("E_NO_BLUETOOTH", "Bluetooth not available")
        return
      }
      
      if (!adapter.isEnabled) {
        Log.w(TAG, "Bluetooth is disabled!")
        promise.reject("E_BLUETOOTH_OFF", "Bluetooth is turned off")
        return
      }
      
      val bonded = adapter.bondedDevices ?: emptySet()
      Log.d(TAG, "Found ${bonded.size} bonded devices")

      fun map(dev: BluetoothDevice, state: String, kind: String): WritableMap {
        val deviceName = dev.name ?: "Unknown Device"
        val deviceAddress = dev.address ?: "Unknown Address"
        
        Log.d(TAG, "Processing device: $deviceName ($deviceAddress) - State: $state, Kind: $kind")
        
        val m = Arguments.createMap()
        m.putString("name", deviceName)
        m.putString("address", deviceAddress)
        m.putString("type", when (dev.type) {
          BluetoothDevice.DEVICE_TYPE_LE -> "LE"
          BluetoothDevice.DEVICE_TYPE_CLASSIC -> "CLASSIC"
          BluetoothDevice.DEVICE_TYPE_DUAL -> "DUAL"
          else -> "UNKNOWN"
        })
        m.putString("state", state)
        m.putString("kind", kind)
        
        // Enhanced device class detection for Galaxy Watches
        val deviceClass = dev.bluetoothClass
        var isWearable = false
        var deviceClassInfo = "Unknown"
        
        if (deviceClass != null) {
          val majorClass = deviceClass.majorDeviceClass
          val minorClass = deviceClass.deviceClass
          
          deviceClassInfo = "Major: $majorClass, Minor: $minorClass"
          Log.d(TAG, "Device class for $deviceName: $deviceClassInfo")
          
          m.putInt("deviceClass", minorClass)
          m.putInt("majorDeviceClass", majorClass)
          
          // Enhanced wearable detection for Galaxy Watches
          isWearable = when (majorClass) {
            BluetoothClass.Device.Major.WEARABLE -> {
              Log.d(TAG, "$deviceName detected as WEARABLE class")
              true
            }
            BluetoothClass.Device.Major.AUDIO_VIDEO -> {
              val isWearableAudio = (minorClass and BluetoothClass.Device.AUDIO_VIDEO_WEARABLE_HEADSET) != 0
              if (isWearableAudio) Log.d(TAG, "$deviceName detected as WEARABLE AUDIO")
              isWearableAudio
            }
            BluetoothClass.Device.Major.PERIPHERAL -> {
              // Some Galaxy Watches appear as peripherals
              Log.d(TAG, "$deviceName detected as PERIPHERAL - could be wearable")
              true
            }
            else -> {
              // Name-based detection for Galaxy Watches that might not set proper class
              val nameContainsWatch = deviceName.lowercase().contains("watch") ||
                                     deviceName.lowercase().contains("galaxy") ||
                                     deviceName.lowercase().contains("fit") ||
                                     deviceName.lowercase().contains("band")
              if (nameContainsWatch) {
                Log.d(TAG, "$deviceName detected as wearable by name")
              }
              nameContainsWatch
            }
          }
        } else {
          // Fallback to name-based detection if no device class
          isWearable = deviceName.lowercase().let { name ->
            name.contains("watch") || name.contains("galaxy") || 
            name.contains("fit") || name.contains("band")
          }
          if (isWearable) {
            Log.d(TAG, "$deviceName detected as wearable by name (no device class)")
          }
        }
        
        m.putBoolean("isWearable", isWearable)
        m.putString("deviceClassInfo", deviceClassInfo)
        
        Log.d(TAG, "Final mapping: $deviceName -> State: $state, Wearable: $isWearable")
        return m
      }

      val out = Arguments.createArray()
      val processedDevices = mutableSetOf<String>()
      
      // Process bonded devices first
      Log.d(TAG, "Processing bonded devices...")
      bonded.forEach { device ->
        val deviceMap = map(device, "BONDED", "BOND")
        out.pushMap(deviceMap)
        processedDevices.add(device.address)
      }

      // Check all possible Bluetooth profiles for connected devices
      val profiles = listOf(
        BluetoothProfile.HEADSET to "HEADSET",
        BluetoothProfile.A2DP to "A2DP", 
        BluetoothProfile.GATT to "GATT",
        BluetoothProfile.GATT_SERVER to "GATT_SERVER",
        BluetoothProfile.HID_HOST to "HID_HOST",
        BluetoothProfile.PAN to "PAN",
        BluetoothProfile.PBAP to "PBAP",
        BluetoothProfile.HEALTH to "HEALTH"
      )
      
      Log.d(TAG, "Checking connected devices across ${profiles.size} profiles...")
      profiles.forEach { (profileId, profileName) ->
        try {
          val connectedDevices = mgr.getConnectedDevices(profileId)
          Log.d(TAG, "Profile $profileName: ${connectedDevices.size} connected devices")
          
          connectedDevices.forEach { device ->
            if (!processedDevices.contains(device.address)) {
              val deviceMap = map(device, "CONNECTED", profileName)
              out.pushMap(deviceMap)
              processedDevices.add(device.address)
            } else {
              Log.d(TAG, "Device ${device.name} already processed, skipping")
            }
          }
        } catch (e: Exception) {
          Log.w(TAG, "Error checking profile $profileName: ${e.message}")
        }
      }

      Log.d(TAG, "=== DeviceHub scan complete: ${processedDevices.size} total devices ===")
      promise.resolve(out)
      
    } catch (e: Exception) { 
      Log.e(TAG, "Error in getDevices: ${e.message}", e)
      promise.reject("E_DEVICES", e.message ?: "Unknown error", e) 
    }
  }
}