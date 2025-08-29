package com.vitalwatch.app

import android.bluetooth.*
import android.content.Context
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = DeviceHubModule.NAME)
class DeviceHubModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object { const val NAME = "DeviceHub" }
  override fun getName() = NAME

  @ReactMethod
  fun getDevices(promise: Promise) {
    try {
      val mgr = reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
      val bonded = BluetoothAdapter.getDefaultAdapter()?.bondedDevices ?: emptySet()

      fun map(dev: BluetoothDevice, state: String, kind: String): WritableMap {
        val m = Arguments.createMap()
        m.putString("name", dev.name)
        m.putString("address", dev.address)
        m.putString("type", when (dev.type) {
          BluetoothDevice.DEVICE_TYPE_LE -> "LE"
          BluetoothDevice.DEVICE_TYPE_CLASSIC -> "CLASSIC"
          BluetoothDevice.DEVICE_TYPE_DUAL -> "DUAL"
          else -> "UNKNOWN"
        })
        m.putString("state", state)
        m.putString("kind", kind)
        
        // Add device class info for better identification
        val deviceClass = dev.bluetoothClass
        if (deviceClass != null) {
          m.putInt("deviceClass", deviceClass.deviceClass)
          m.putInt("majorDeviceClass", deviceClass.majorDeviceClass)
          
          // Check if it's a wearable device
          val isWearable = when (deviceClass.majorDeviceClass) {
            BluetoothClass.Device.Major.WEARABLE -> true
            BluetoothClass.Device.Major.AUDIO_VIDEO -> {
              // Check if it's a wearable audio device
              (deviceClass.deviceClass and BluetoothClass.Device.AUDIO_VIDEO_WEARABLE_HEADSET) != 0
            }
            else -> false
          }
          m.putBoolean("isWearable", isWearable)
        }
        
        return m
      }

      val out = Arguments.createArray()
      // Bonded list
      bonded.forEach { out.pushMap(map(it, "BONDED", "BOND")) }

      // Connected by profile
      val profiles = listOf(
        BluetoothProfile.HEADSET to "HEADSET",
        BluetoothProfile.A2DP to "A2DP",
        BluetoothProfile.GATT to "GATT"
      )
      profiles.forEach { (id, label) ->
        try {
          val list = mgr.getConnectedDevices(id)
          list.forEach { out.pushMap(map(it, "CONNECTED", label)) }
        } catch (e: Exception) {
          // Some profiles might not be available
        }
      }

      promise.resolve(out)
    } catch (e: Exception) { 
      promise.reject("E_DEVICES", e.message ?: "Unknown error", e) 
    }
  }
}