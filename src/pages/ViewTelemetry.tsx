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

      const normalized = (response.telemetry || []).map((t: any) => ({
        id: t.id,
        vehicleId: t.vehicleId,

        // convert backend metrics → UI metrics
        speed: t.engineRpm ? t.engineRpm / 100 : 0,
        temperature: t.coolantTemp ?? t.lubOilTemp ?? 0,
        battery: t.batteryVoltage ?? 0,
        energy: t.fuelPressure ?? 0,

        location: t.rawPayload?.location ?? "N/A",
        timestamp: t.recordedAt,
        recordedAt: t.recordedAt,
      }));

      setTelemetryData(normalized);
    } catch (err) {
      console.error("Failed to load telemetry", err);
      setTelemetryData([]);
    }
  };

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

        {/* Stats Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Vehicles
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.totalVehicles}
                </p>
              </div>

              <div className="bg-blue-100 p-3 rounded-lg">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Avg Speed
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.averageSpeed} km/h
                </p>
              </div>

              <div className="bg-green-100 p-3 rounded-lg">
                <Gauge className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Avg Temperature
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.averageTemperature} °C
                </p>
              </div>

              <div className="bg-orange-100 p-3 rounded-lg">
                <Thermometer className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Avg Battery
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.averageBattery} %
                </p>
              </div>

              <div className="bg-purple-100 p-3 rounded-lg">
                <Battery className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Controls */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">

            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>

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

        {/* Table */}

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
                    <th className="px-6 py-4 text-left text-xs font-semibold">Location</th>
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
                        {entry.speed.toFixed(1)} km/h
                      </td>

                      <td className="px-6 py-4">
                        {entry.temperature.toFixed(1)} °C
                      </td>

                      <td className="px-6 py-4">
                        {entry.battery} %
                      </td>

                      <td className="px-6 py-4">
                        {entry.energy} kWh
                      </td>

                      <td className="px-6 py-4">
                        {entry.location}
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

        {filteredAndSortedData.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredAndSortedData.length} of {telemetryData.length} entries
          </div>
        )}

      </div>
    </div>
  );
}