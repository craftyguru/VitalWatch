import { db } from "../db";
import { sensorData, users, aiInsights, crisisPreventions } from "@shared/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { aiCrisisPreventionService } from "./aiCrisisPreventionService";

interface SensorReading {
  userId: string;
  sensorType: 'heart_rate' | 'steps' | 'sleep' | 'stress' | 'activity' | 'blood_oxygen' | 'temperature';
  value: number;
  unit: string;
  deviceId?: string;
  confidence?: number;
  metadata?: any;
  recordedAt: Date;
}

interface HealthAlert {
  type: 'heart_rate_spike' | 'sleep_disruption' | 'stress_elevation' | 'activity_drop' | 'data_gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  triggerValue: number;
  normalRange: string;
}

export class SensorMonitoringService {

  /**
   * Record new sensor data and analyze for anomalies
   */
  async recordSensorData(reading: SensorReading): Promise<void> {
    try {
      // Store the sensor reading
      await db.insert(sensorData).values({
        userId: reading.userId,
        sensorType: reading.sensorType,
        value: reading.value.toString(),
        unit: reading.unit,
        deviceId: reading.deviceId,
        confidence: reading.confidence?.toString(),
        metadata: reading.metadata,
        recordedAt: reading.recordedAt
      });

      // Analyze for immediate anomalies
      await this.analyzeRealTimeAnomalies(reading);

      console.log(`📊 Recorded ${reading.sensorType} data for user ${reading.userId}: ${reading.value} ${reading.unit}`);

    } catch (error) {
      console.error('Failed to record sensor data:', error);
    }
  }

  /**
   * Continuously monitor user's sensor data for health patterns
   */
  async startContinuousMonitoring(userId: string): Promise<void> {
    console.log(`🔄 Starting continuous monitoring for user ${userId}`);
    
    // Check if Web APIs are supported
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      // Start geolocation monitoring for activity detection
      this.startLocationMonitoring(userId);
    }

    // Initialize device sensor monitoring
    this.initializeDeviceSensors(userId);
  }

  /**
   * Simulate real-time sensor data (for demonstration)
   */
  async simulateSensorData(userId: string): Promise<void> {
    const now = new Date();
    
    // Heart rate (60-100 normal, spikes indicate stress/panic)
    const baseHeartRate = 72 + Math.random() * 15; // 72-87 normal range
    const stressMultiplier = Math.random() > 0.9 ? 1.4 : 1; // 10% chance of stress spike
    const heartRate = baseHeartRate * stressMultiplier;
    
    await this.recordSensorData({
      userId,
      sensorType: 'heart_rate',
      value: Math.round(heartRate),
      unit: 'bpm',
      deviceId: 'simulated-sensor',
      confidence: 0.9,
      recordedAt: now
    });

    // Activity level (0-100%)
    const timeOfDay = now.getHours();
    let activityLevel;
    if (timeOfDay >= 22 || timeOfDay <= 6) {
      activityLevel = Math.random() * 20; // Low activity at night
    } else if (timeOfDay >= 7 && timeOfDay <= 9) {
      activityLevel = 40 + Math.random() * 40; // Morning activity
    } else {
      activityLevel = 30 + Math.random() * 50; // Day activity
    }

    await this.recordSensorData({
      userId,
      sensorType: 'activity',
      value: Math.round(activityLevel),
      unit: 'percentage',
      deviceId: 'simulated-sensor',
      confidence: 0.8,
      recordedAt: now
    });

    // Stress level (0-100%)
    const baseStress = 20 + Math.random() * 30; // 20-50% normal
    const elevatedStress = Math.random() > 0.85 ? 30 : 0; // 15% chance of elevation
    const stressLevel = Math.min(baseStress + elevatedStress, 95);

    await this.recordSensorData({
      userId,
      sensorType: 'stress',
      value: Math.round(stressLevel),
      unit: 'percentage',
      deviceId: 'simulated-sensor',
      confidence: 0.7,
      recordedAt: now
    });

    // Sleep data (once per day, around 6-9 hours)
    if (timeOfDay === 7 && Math.random() > 0.5) { // 50% chance at 7 AM
      const sleepHours = 5 + Math.random() * 4; // 5-9 hours
      await this.recordSensorData({
        userId,
        sensorType: 'sleep',
        value: parseFloat(sleepHours.toFixed(1)),
        unit: 'hours',
        deviceId: 'simulated-sensor',
        confidence: 0.85,
        recordedAt: now
      });
    }
  }

  /**
   * Analyze real-time sensor data for anomalies
   */
  private async analyzeRealTimeAnomalies(reading: SensorReading): Promise<void> {
    const alerts: HealthAlert[] = [];

    switch (reading.sensorType) {
      case 'heart_rate':
        if (reading.value > 120) {
          alerts.push({
            type: 'heart_rate_spike',
            severity: reading.value > 140 ? 'critical' : 'high',
            message: `Elevated heart rate detected: ${reading.value} bpm`,
            recommendation: 'Consider breathing exercises or seek medical attention if persistent',
            triggerValue: reading.value,
            normalRange: '60-100 bpm'
          });
        }
        break;

      case 'stress':
        if (reading.value > 70) {
          alerts.push({
            type: 'stress_elevation',
            severity: reading.value > 85 ? 'high' : 'medium',
            message: `High stress level detected: ${reading.value}%`,
            recommendation: 'Try deep breathing or mindfulness exercises',
            triggerValue: reading.value,
            normalRange: '0-50%'
          });
        }
        break;

      case 'sleep':
        if (reading.value < 5) {
          alerts.push({
            type: 'sleep_disruption',
            severity: reading.value < 3 ? 'high' : 'medium',
            message: `Insufficient sleep detected: ${reading.value} hours`,
            recommendation: 'Prioritize sleep hygiene and consider sleep support',
            triggerValue: reading.value,
            normalRange: '7-9 hours'
          });
        }
        break;

      case 'activity':
        if (reading.value < 10 && new Date().getHours() > 10 && new Date().getHours() < 22) {
          alerts.push({
            type: 'activity_drop',
            severity: 'medium',
            message: `Very low activity detected: ${reading.value}%`,
            recommendation: 'Consider gentle movement or walking',
            triggerValue: reading.value,
            normalRange: '30-70%'
          });
        }
        break;
    }

    // Process any alerts
    for (const alert of alerts) {
      await this.processHealthAlert(reading.userId, alert);
    }
  }

  /**
   * Process health alerts and take appropriate action
   */
  private async processHealthAlert(userId: string, alert: HealthAlert): Promise<void> {
    try {
      // Store as AI insight
      await db.insert(aiInsights).values({
        userId,
        type: 'sensor_alert',
        insight: alert.message,
        confidence: '0.8',
        isActionable: true,
        metadata: {
          alertType: alert.type,
          severity: alert.severity,
          recommendation: alert.recommendation,
          triggerValue: alert.triggerValue,
          normalRange: alert.normalRange
        }
      });

      // High severity alerts trigger crisis prevention analysis
      if (alert.severity === 'high' || alert.severity === 'critical') {
        // Record as crisis prevention trigger
        await db.insert(crisisPreventions).values({
          userId,
          triggerType: 'sensor_alert',
          triggerData: alert,
          interventionType: this.getInterventionType(alert.type),
          aiConfidence: '0.8',
          followUpRequired: alert.severity === 'critical'
        });

        // For critical alerts, run full crisis analysis
        if (alert.severity === 'critical') {
          await aiCrisisPreventionService.analyzeCrisisRisk(userId);
        }
      }

      console.log(`🚨 Health alert for user ${userId}: ${alert.type} - ${alert.severity}`);

    } catch (error) {
      console.error('Failed to process health alert:', error);
    }
  }

  /**
   * Get intervention type based on alert type
   */
  private getInterventionType(alertType: string): string {
    switch (alertType) {
      case 'heart_rate_spike':
        return 'breathing_exercise';
      case 'stress_elevation':
        return 'breathing_exercise';
      case 'sleep_disruption':
        return 'sleep_hygiene';
      case 'activity_drop':
        return 'movement_reminder';
      default:
        return 'wellness_check';
    }
  }

  /**
   * Analyze sensor patterns over time
   */
  async analyzeLongTermPatterns(userId: string): Promise<any> {
    try {
      // Get last 30 days of sensor data
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const recentData = await db
        .select()
        .from(sensorData)
        .where(and(
          eq(sensorData.userId, userId),
          gte(sensorData.recordedAt, thirtyDaysAgo)
        ))
        .orderBy(desc(sensorData.recordedAt));

      // Group by sensor type
      const dataByType = recentData.reduce((acc, record) => {
        if (!acc[record.sensorType]) acc[record.sensorType] = [];
        acc[record.sensorType].push({
          value: parseFloat(record.value),
          date: record.recordedAt
        });
        return acc;
      }, {} as any);

      // Analyze trends for each sensor type
      const patterns = {};
      for (const [sensorType, data] of Object.entries(dataByType) as any) {
        patterns[sensorType] = this.analyzeDataTrend(data);
      }

      return patterns;

    } catch (error) {
      console.error('Pattern analysis failed:', error);
      return {};
    }
  }

  /**
   * Analyze trend in sensor data
   */
  private analyzeDataTrend(data: any[]): any {
    if (data.length < 3) return { trend: 'insufficient_data' };

    const values = data.map(d => d.value);
    const recent = values.slice(0, Math.floor(values.length / 2));
    const older = values.slice(Math.floor(values.length / 2));

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      trend: percentChange > 10 ? 'increasing' : percentChange < -10 ? 'decreasing' : 'stable',
      percentChange: Math.round(percentChange),
      recentAverage: Math.round(recentAvg * 100) / 100,
      oldAverage: Math.round(olderAvg * 100) / 100,
      dataPoints: data.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  /**
   * Initialize device sensors (Web APIs)
   */
  private async initializeDeviceSensors(userId: string): Promise<void> {
    try {
      // Check for available APIs
      if (typeof window !== 'undefined') {
        // Generic Sensor API (limited browser support)
        if ('Accelerometer' in window) {
          this.initializeAccelerometer(userId);
        }

        // Device Motion API (more widely supported)
        if ('DeviceMotionEvent' in window) {
          this.initializeDeviceMotion(userId);
        }

        // Battery API
        if ('getBattery' in navigator) {
          this.initializeBatteryMonitoring(userId);
        }

        // Ambient Light API
        if ('AmbientLightSensor' in window) {
          this.initializeAmbientLight(userId);
        }
      }

      console.log(`📱 Device sensors initialized for user ${userId}`);

    } catch (error) {
      console.error('Device sensor initialization failed:', error);
    }
  }

  /**
   * Initialize accelerometer for activity detection
   */
  private initializeAccelerometer(userId: string): void {
    try {
      if (typeof window !== 'undefined' && 'Accelerometer' in window) {
        const sensor = new (window as any).Accelerometer({ frequency: 1 }); // 1 Hz
        
        sensor.addEventListener('reading', () => {
          const magnitude = Math.sqrt(
            sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2
          );
          
          // Convert to activity level (0-100%)
          const activityLevel = Math.min(magnitude * 10, 100);
          
          this.recordSensorData({
            userId,
            sensorType: 'activity',
            value: activityLevel,
            unit: 'percentage',
            deviceId: 'accelerometer',
            confidence: 0.8,
            recordedAt: new Date()
          });
        });

        sensor.start();
      }
    } catch (error) {
      console.error('Accelerometer initialization failed:', error);
    }
  }

  /**
   * Initialize device motion for activity detection
   */
  private initializeDeviceMotion(userId: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.addEventListener('devicemotion', (event) => {
          if (event.acceleration) {
            const { x, y, z } = event.acceleration;
            if (x !== null && y !== null && z !== null) {
              const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
              const activityLevel = Math.min(magnitude * 5, 100);
              
              // Throttle to once per minute
              if (Math.random() < 0.017) { // ~1/60 chance
                this.recordSensorData({
                  userId,
                  sensorType: 'activity',
                  value: activityLevel,
                  unit: 'percentage',
                  deviceId: 'device-motion',
                  confidence: 0.7,
                  recordedAt: new Date()
                });
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Device motion initialization failed:', error);
    }
  }

  /**
   * Initialize battery monitoring (can indicate device usage patterns)
   */
  private async initializeBatteryMonitoring(userId: string): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        // Monitor battery level changes (indicates device usage)
        battery.addEventListener('levelchange', () => {
          // Battery drain rate can indicate activity level
          const drainRate = (1 - battery.level) * 100;
          
          this.recordSensorData({
            userId,
            sensorType: 'activity',
            value: drainRate,
            unit: 'percentage',
            deviceId: 'battery-monitor',
            confidence: 0.5,
            metadata: {
              batteryLevel: battery.level,
              charging: battery.charging
            },
            recordedAt: new Date()
          });
        });
      }
    } catch (error) {
      console.error('Battery monitoring initialization failed:', error);
    }
  }

  /**
   * Initialize ambient light sensor (can indicate indoor/outdoor activity)
   */
  private initializeAmbientLight(userId: string): void {
    try {
      if (typeof window !== 'undefined' && 'AmbientLightSensor' in window) {
        const sensor = new (window as any).AmbientLightSensor();
        
        sensor.addEventListener('reading', () => {
          // Light levels can indicate circadian patterns and outdoor activity
          const lightLevel = sensor.illuminance;
          
          this.recordSensorData({
            userId,
            sensorType: 'activity',
            value: lightLevel > 1000 ? 80 : 40, // Bright = likely active
            unit: 'percentage',
            deviceId: 'ambient-light',
            confidence: 0.6,
            metadata: {
              illuminance: lightLevel,
              environment: lightLevel > 10000 ? 'outdoor' : 'indoor'
            },
            recordedAt: new Date()
          });
        });

        sensor.start();
      }
    } catch (error) {
      console.error('Ambient light sensor initialization failed:', error);
    }
  }

  /**
   * Start location monitoring for activity detection
   */
  private startLocationMonitoring(userId: string): void {
    try {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.watchPosition(
          (position) => {
            // Movement between positions indicates activity
            const speed = position.coords.speed || 0;
            const activityLevel = Math.min(speed * 20, 100); // Convert m/s to activity %
            
            this.recordSensorData({
              userId,
              sensorType: 'activity',
              value: activityLevel,
              unit: 'percentage',
              deviceId: 'gps',
              confidence: 0.9,
              metadata: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                speed: speed,
                accuracy: position.coords.accuracy
              },
              recordedAt: new Date()
            });
          },
          (error) => console.error('Geolocation error:', error),
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000 // Cache for 1 minute
          }
        );
      }
    } catch (error) {
      console.error('Location monitoring initialization failed:', error);
    }
  }

  /**
   * Get latest sensor readings for dashboard
   */
  async getLatestReadings(userId: string): Promise<any> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentData = await db
        .select()
        .from(sensorData)
        .where(and(
          eq(sensorData.userId, userId),
          gte(sensorData.recordedAt, oneDayAgo)
        ))
        .orderBy(desc(sensorData.recordedAt))
        .limit(100);

      // Group by sensor type and get latest reading
      const latestReadings = recentData.reduce((acc, record) => {
        if (!acc[record.sensorType] || new Date(record.recordedAt) > new Date(acc[record.sensorType].recordedAt)) {
          acc[record.sensorType] = {
            value: parseFloat(record.value),
            unit: record.unit,
            recordedAt: record.recordedAt,
            deviceId: record.deviceId
          };
        }
        return acc;
      }, {} as any);

      return latestReadings;

    } catch (error) {
      console.error('Failed to get latest readings:', error);
      return {};
    }
  }

  /**
   * Run sensor monitoring for all active users (called by scheduler)
   */
  async runSensorMonitoring(): Promise<void> {
    try {
      console.log('📊 Running sensor monitoring for all users...');
      
      // Get active users
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(gte(users.updatedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

      for (const user of activeUsers) {
        // Simulate sensor data for demonstration
        await this.simulateSensorData(user.id);
        
        // Analyze patterns
        const patterns = await this.analyzeLongTermPatterns(user.id);
        
        console.log(`📈 Patterns for user ${user.id}:`, Object.keys(patterns).length);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`✅ Sensor monitoring completed for ${activeUsers.length} users`);
      
    } catch (error) {
      console.error('Sensor monitoring failed:', error);
    }
  }
}

export const sensorMonitoringService = new SensorMonitoringService();