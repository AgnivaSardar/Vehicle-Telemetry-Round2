import { useState, useEffect, useMemo } from "react";
import { apiService } from "../services/api";
import type { TelemetryData, TelemetryStats } from "../types/telemetry";
import {
  Search,
  RefreshCw,
  Car,
  Gauge,
  Thermometer,
  Battery,
  AlertCircle,
} from "lucide-react";

export default function ViewTelemetry() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const response = await apiService.getTelemetry();

      const normalized: TelemetryData[] = (response.telemetry || []).map((t: any) => ({
        id: t.id,
        vehicleId: t.vehicleId,

        speed: Number((t.engineRpm ?? t.rpm ?? 0) / 100),
        temperature: Number(t.coolantTemp ?? t.engineTemp ?? t.lubOilTemp ?? 0),
        battery: Number(t.batteryVoltage ?? 0),
        energy: Number(t.fuelPressure ?? 0),

        recordedAt: t.recordedAt,

        engineRpm: t.engineRpm,
        lubOilPressure: t.lubOilPressure,
        fuelPressure: t.fuelPressure,
        coolantPressure: t.coolantPressure,
        lubOilTemp: t.lubOilTemp,
        coolantTemp: t.coolantTemp,
        engineTemp: t.engineTemp,
        rpm: t.rpm,
        batteryVoltage: t.batteryVoltage,
        oilPressure: t.oilPressure,
        mileage: t.mileage,
        vibrationLevel: t.vibrationLevel,
        fuelEfficiency: t.fuelEfficiency,
        errorCodesCount: t.errorCodesCount,
        coolantLevel: t.coolantLevel,
        ambientTemperature: t.ambientTemperature,
      }));

      setTelemetryData(normalized);
    } catch (err) {
      console.error("Failed to load telemetry", err);
      setTelemetryData([]);
    }
  };

  /* ---------- LATEST RECORD ---------- */

  const latestTelemetry = useMemo(() => {
    if (telemetryData.length === 0) return null;

    return [...telemetryData].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() -
        new Date(a.recordedAt).getTime()
    )[0];
  }, [telemetryData]);

  /* ---------- STATS ---------- */

  const stats = useMemo((): TelemetryStats => {
    if (telemetryData.length === 0) {
      return {
        totalVehicles: 0,
        averageSpeed: 0,
        averageTemperature: 0,
        averageBattery: 0,
      };
    }

    const uniqueVehicles = new Set(
      telemetryData.map((d) => d.vehicleId)
    ).size;

    const avgSpeed =
      telemetryData.reduce((sum, d) => sum + (d.speed || 0), 0) /
      telemetryData.length;

    const avgTemp =
      telemetryData.reduce((sum, d) => sum + (d.temperature || 0), 0) /
      telemetryData.length;

    const avgBattery =
      telemetryData.reduce((sum, d) => sum + (d.battery || 0), 0) /
      telemetryData.length;

    return {
      totalVehicles: uniqueVehicles,
      averageSpeed: Number(avgSpeed.toFixed(1)),
      averageTemperature: Number(avgTemp.toFixed(1)),
      averageBattery: Number(avgBattery.toFixed(1)),
    };
  }, [telemetryData]);

  /* ---------- FILTERING ---------- */

  const filteredAndSortedData = useMemo(() => {
    let filtered = telemetryData;

    if (searchQuery.trim()) {
      filtered = filtered.filter((entry) =>
        entry.vehicleId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const timeA = new Date(a.recordedAt).getTime();
      const timeB = new Date(b.recordedAt).getTime();

      return sortOrder === "desc"
        ? timeB - timeA
        : timeA - timeB;
    });

    return filtered;
  }, [telemetryData, searchQuery, sortOrder]);

  const formatDateTime = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";

    const date = new Date(timestamp);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-7xl">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Telemetry Dashboard
        </h1>

        {/* ----------- LATEST TELEMETRY DASHBOARD ----------- */}

        {latestTelemetry && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

            <h2 className="text-xl font-bold mb-4">
              Latest Telemetry ({latestTelemetry.vehicleId})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">

              <Metric label="Engine RPM" value={latestTelemetry.engineRpm} />
              <Metric label="Engine Temp" value={latestTelemetry.engineTemp} />
              <Metric label="Coolant Temp" value={latestTelemetry.coolantTemp} />
              <Metric label="Oil Temp" value={latestTelemetry.lubOilTemp} />
              <Metric label="Oil Pressure" value={latestTelemetry.lubOilPressure} />
              <Metric label="Fuel Pressure" value={latestTelemetry.fuelPressure} />

              <Metric label="Battery Voltage" value={latestTelemetry.batteryVoltage} />
              <Metric label="Mileage" value={latestTelemetry.mileage} />
              <Metric label="Vibration" value={latestTelemetry.vibrationLevel} />
              <Metric label="Fuel Efficiency" value={latestTelemetry.fuelEfficiency} />
              <Metric label="Coolant Level" value={latestTelemetry.coolantLevel} />
              <Metric label="Ambient Temp" value={latestTelemetry.ambientTemperature} />

              <Metric label="Error Codes" value={latestTelemetry.errorCodesCount} />
              <Metric label="Recorded At" value={formatDateTime(latestTelemetry.recordedAt)} />

            </div>
          </div>
        )}

        {/* ---------- EXISTING STATS (UNCHANGED) ---------- */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <StatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={<Car className="w-8 h-8 text-blue-600" />}
            color="blue"
          />

          <StatCard
            title="Avg Speed"
            value={`${stats.averageSpeed} km/h`}
            icon={<Gauge className="w-8 h-8 text-green-600" />}
            color="green"
          />

          <StatCard
            title="Avg Temperature"
            value={`${stats.averageTemperature} °C`}
            icon={<Thermometer className="w-8 h-8 text-orange-600" />}
            color="orange"
          />

          <StatCard
            title="Avg Battery"
            value={stats.averageBattery}
            icon={<Battery className="w-8 h-8 text-purple-600" />}
            color="purple"
          />

        </div>

        {/* ---------- SEARCH ---------- */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">

            <div className="relative flex-1 md:max-w-md">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>

              <input
                type="text"
                placeholder="Search by Vehicle ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <RefreshCw className="w-4 h-4"/>
              <span>Sort {sortOrder === "desc" ? "Oldest" : "Newest"}</span>
            </button>

          </div>
        </div>

        {/* ---------- TABLE (UNCHANGED) ---------- */}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {filteredAndSortedData.length === 0 ? (

            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Telemetry Data Found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try adjusting your search query."
                  : "Start by adding some telemetry data."}
              </p>
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Vehicle ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Speed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Temperature</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Battery</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Energy</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">Timestamp</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredAndSortedData.map((entry) => (
                    <tr key={entry.id}>

                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {entry.vehicleId}
                      </td>

                      <td className="px-6 py-4">
                        {entry.speed?.toFixed(1)} km/h
                      </td>

                      <td className="px-6 py-4">
                        {entry.temperature?.toFixed(1)} °C
                      </td>

                      <td className="px-6 py-4">
                        {entry.battery}
                      </td>

                      <td className="px-6 py-4">
                        {entry.energy}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(entry.recordedAt)}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value ?? "N/A"}</p>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: any) {
  const colors: any = {
    blue: "border-blue-500 bg-blue-100",
    green: "border-green-500 bg-green-100",
    orange: "border-orange-500 bg-orange-100",
    purple: "border-purple-500 bg-purple-100",
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}