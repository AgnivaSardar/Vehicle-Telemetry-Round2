const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vehixa-round2.onrender.com/api/v1';

export interface TelemetryPayload {
  vehicleId: string;
  speed: number;
  temperature: number;
  battery: number;
  energy: number;
  location: string;
}

export interface TelemetryResponse {
  message: string;
  telemetry: {
    id: string;
    vehicleId: string;
    speed: number;
    temperature: number;
    battery: number;
    energy: number;
    location: string;
    recordedAt: string;
  };
}

export interface TelemetryListResponse {
  count: number;
  telemetry: Array<{
    id: string;
    vehicleId: string;
    speed: number;
    temperature: number;
    battery: number;
    energy: number;
    location: string;
    recordedAt: string;
  }>;
}

export const apiService = {
  // Ingest telemetry data
  ingestTelemetry: async (data: TelemetryPayload): Promise<TelemetryResponse> => {
    const response = await fetch(`${API_BASE_URL}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehicleId: data.vehicleId,
        speed: data.speed,
        temperature: data.temperature,
        battery: data.battery,
        energy: data.energy,
        location: data.location,
        source: 'web',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to ingest telemetry: ${response.statusText}`);
    }

    return response.json();
  },

  // Get all telemetry data
  getTelemetry: async (vehicleId?: string, limit?: number): Promise<TelemetryListResponse> => {
    const params = new URLSearchParams();
    if (vehicleId) params.append('vehicleId', vehicleId);
    if (limit) params.append('limit', limit.toString());

    const url = `${API_BASE_URL}/telemetry${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch telemetry: ${response.statusText}`);
    }

    return response.json();
  },

  // Get latest telemetry for a vehicle
  getLatestTelemetry: async (vehicleId?: string): Promise<{ telemetry: any }> => {
    const params = new URLSearchParams();
    if (vehicleId) params.append('vehicleId', vehicleId);

    const url = `${API_BASE_URL}/telemetry/latest${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch latest telemetry: ${response.statusText}`);
    }

    return response.json();
  },
};
