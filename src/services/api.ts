const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vehixa-round2.onrender.com/api/v1";

export interface TelemetryPayload {
  vehicleId: string;
  source?: string;

  engine_rpm?: number;
  rpm?: number;

  lub_oil_pressure?: number;
  oil_pressure?: number;

  fuel_pressure?: number;
  coolant_pressure?: number;

  lub_oil_temp?: number;
  coolant_temp?: number;
  engine_temp?: number;

  battery_voltage?: number;

  mileage?: number;
  vibration_level?: number;
  fuel_efficiency?: number;

  coolant_level?: number;
  ambient_temperature?: number;

  error_codes_count?: number;

  recordedAt?: string;
}

export interface TelemetryRecord {
  id: number;
  vehicleId: string;
  source?: string;

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

  recordedAt: string;
  receivedAt?: string;

  rawPayload?: any;
}

export interface TelemetryResponse {
  message?: string;
  telemetry: TelemetryRecord;
}

export interface TelemetryListResponse {
  count?: number;
  telemetry: TelemetryRecord[];
}

export const apiService = {
  // Ingest telemetry
  ingestTelemetry: async (
    data: TelemetryPayload
  ): Promise<TelemetryResponse> => {
    const response = await fetch(`${API_BASE_URL}/telemetry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        source: data.source || "web",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to ingest telemetry: ${response.statusText}`);
    }

    return response.json();
  },

  // Fetch telemetry list
  getTelemetry: async (
    vehicleId?: string,
    limit?: number
  ): Promise<TelemetryListResponse> => {
    const params = new URLSearchParams();

    if (vehicleId) params.append("vehicleId", vehicleId);
    if (limit) params.append("limit", limit.toString());

    const url = `${API_BASE_URL}/telemetry${
      params.toString() ? "?" + params.toString() : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch telemetry: ${response.statusText}`);
    }

    return response.json();
  },

  // Fetch latest telemetry
  getLatestTelemetry: async (
    vehicleId?: string
  ): Promise<{ telemetry: TelemetryRecord }> => {
    const params = new URLSearchParams();

    if (vehicleId) params.append("vehicleId", vehicleId);

    const url = `${API_BASE_URL}/telemetry/latest${
      params.toString() ? "?" + params.toString() : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch latest telemetry: ${response.statusText}`
      );
    }

    return response.json();
  },
};