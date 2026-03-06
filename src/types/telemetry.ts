export interface TelemetryData {
  id: number;
  vehicleId: string;

  // UI fields (derived)
  speed: number;
  temperature: number;
  battery: number;
  energy: number;
  location: string;

  recordedAt: string;

  // Full backend telemetry fields
  engineRpm?: number;
  rpm?: number;

  lubOilPressure?: number;
  oilPressure?: number;

  fuelPressure?: number;
  coolantPressure?: number;

  lubOilTemp?: number;
  coolantTemp?: number;
  engineTemp?: number;

  batteryVoltage?: number;

  mileage?: number;
  vibrationLevel?: number;
  fuelEfficiency?: number;

  coolantLevel?: number;
  ambientTemperature?: number;

  errorCodesCount?: number;
}

export interface TelemetryStats {
  totalVehicles: number;
  averageSpeed: number;
  averageTemperature: number;
  averageBattery: number;
}