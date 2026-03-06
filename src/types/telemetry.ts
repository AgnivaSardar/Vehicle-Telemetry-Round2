export interface TelemetryData {
  id: string;
  vehicleId: string;
  speed: number;
  temperature: number;
  battery: number;
  energy: number;
  location: string;
  recordedAt: string;
}

export interface TelemetryStats {
  totalVehicles: number;
  averageSpeed: number;
  averageTemperature: number;
  averageBattery: number;
}