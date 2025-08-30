package com.vitalwatch.app

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = HealthConnectModule.NAME)
class HealthConnectModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object { 
    const val NAME = "HealthConnect"
    const val TAG = "HealthConnectModule"
    const val HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata"
  }
  
  override fun getName() = NAME

  @ReactMethod
  fun isAvailable(promise: Promise) {
    try {
      Log.d(TAG, "Checking Health Connect availability...")
      
      val packageManager = reactApplicationContext.packageManager
      val isInstalled = try {
        packageManager.getPackageInfo(HEALTH_CONNECT_PACKAGE, 0)
        true
      } catch (e: PackageManager.NameNotFoundException) {
        false
      }
      
      Log.d(TAG, "Health Connect installed: $isInstalled")
      
      val result = Arguments.createMap()
      result.putBoolean("installed", isInstalled)
      result.putString("packageName", HEALTH_CONNECT_PACKAGE)
      
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "Error checking Health Connect availability", e)
      promise.reject("E_HEALTH_CONNECT_CHECK", e.message ?: "Unknown error", e)
    }
  }

  @ReactMethod
  fun requestPermissions(promise: Promise) {
    try {
      Log.d(TAG, "Requesting Health Connect permissions...")
      
      // For now, just return mock success
      // In a full implementation, this would:
      // 1. Check if Health Connect is available
      // 2. Request specific permissions (READ_HEART_RATE, READ_STEPS, etc.)
      // 3. Handle the permission flow
      
      val result = Arguments.createMap()
      result.putBoolean("granted", true)
      result.putString("status", "mock_granted")
      
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "Error requesting Health Connect permissions", e)
      promise.reject("E_PERMISSION_REQUEST", e.message ?: "Unknown error", e)
    }
  }

  @ReactMethod
  fun readHeartRateData(promise: Promise) {
    try {
      Log.d(TAG, "Reading heart rate data from Health Connect...")
      
      // Mock data for demonstration
      // In a full implementation, this would query Health Connect APIs
      val data = Arguments.createArray()
      
      val heartRateRecord = Arguments.createMap()
      heartRateRecord.putDouble("bpm", 72.0)
      heartRateRecord.putString("timestamp", "2025-08-30T07:30:00Z")
      heartRateRecord.putString("source", "Galaxy Watch5 Pro")
      data.pushMap(heartRateRecord)
      
      val result = Arguments.createMap()
      result.putArray("records", data)
      result.putInt("count", 1)
      
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "Error reading heart rate data", e)
      promise.reject("E_READ_HEART_RATE", e.message ?: "Unknown error", e)
    }
  }

  @ReactMethod
  fun readStepsData(promise: Promise) {
    try {
      Log.d(TAG, "Reading steps data from Health Connect...")
      
      // Mock data for demonstration
      val data = Arguments.createArray()
      
      val stepsRecord = Arguments.createMap()
      stepsRecord.putInt("count", 8453)
      stepsRecord.putString("timestamp", "2025-08-30T07:30:00Z")
      stepsRecord.putString("source", "Galaxy Watch5 Pro")
      data.pushMap(stepsRecord)
      
      val result = Arguments.createMap()
      result.putArray("records", data)
      result.putInt("count", 1)
      
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "Error reading steps data", e)
      promise.reject("E_READ_STEPS", e.message ?: "Unknown error", e)
    }
  }

  @ReactMethod
  fun openHealthConnectSettings(promise: Promise) {
    try {
      Log.d(TAG, "Opening Health Connect settings...")
      
      val intent = Intent().apply {
        action = "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE"
        data = Uri.parse("healthconnect://permissions")
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      
      if (intent.resolveActivity(reactApplicationContext.packageManager) != null) {
        reactApplicationContext.startActivity(intent)
        promise.resolve(true)
      } else {
        // Fallback to Health Connect app
        val fallbackIntent = reactApplicationContext.packageManager.getLaunchIntentForPackage(HEALTH_CONNECT_PACKAGE)
        if (fallbackIntent != null) {
          fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          reactApplicationContext.startActivity(fallbackIntent)
          promise.resolve(true)
        } else {
          promise.resolve(false)
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error opening Health Connect settings", e)
      promise.reject("E_OPEN_SETTINGS", e.message ?: "Unknown error", e)
    }
  }
}