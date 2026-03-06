import { useState } from "react";
import type { FormEvent } from "react";
import { apiService } from "../services/api";
import {
  Car,
  Gauge,
  Thermometer,
  Battery,
  Zap,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AddTelemetry() {
  const [formData, setFormData] = useState({
    vehicleId: "",
    speed: "",
    temperature: "",
    battery: "",
    energy: "",
    location: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId.trim()) {
      newErrors.vehicleId = "Vehicle ID is required";
    }

    const speed = Number(formData.speed);
    const temp = Number(formData.temperature);
    const battery = Number(formData.battery);
    const energy = Number(formData.energy);

    if (isNaN(speed) || speed < 0) {
      newErrors.speed = "Valid speed is required";
    }

    if (isNaN(temp) || temp < -50 || temp > 200) {
      newErrors.temperature = "Temperature must be between -50°C and 200°C";
    }

    if (isNaN(battery) || battery < 0 || battery > 100) {
      newErrors.battery = "Battery must be between 0% and 100%";
    }

    if (isNaN(energy) || energy < 0) {
      newErrors.energy = "Valid energy consumption is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setShowError(false);

    try {
      await apiService.ingestTelemetry({
        vehicleId: formData.vehicleId.trim(),
        speed: Number(formData.speed),
        temperature: Number(formData.temperature),
        battery: Number(formData.battery),
        energy: Number(formData.energy),
        location: formData.location.trim(),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setFormData({
        vehicleId: "",
        speed: "",
        temperature: "",
        battery: "",
        energy: "",
        location: "",
      });

      setErrors({});
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save telemetry data"
      );
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-3xl">

        {/* Success Message */}

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-medium">
              Telemetry data saved successfully!
            </p>
          </div>
        )}

        {/* Error Message */}

        {showError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Car className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add Telemetry Data
              </h1>
              <p className="text-gray-600">
                Enter vehicle operational metrics
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Vehicle ID */}

            <InputField
              icon={<Car size={16} />}
              label="Vehicle ID"
              value={formData.vehicleId}
              onChange={(v) => handleChange("vehicleId", v)}
              error={errors.vehicleId}
              placeholder="e.g., VEH-102"
            />

            {/* Speed */}

            <InputField
              icon={<Gauge size={16} />}
              label="Speed (km/h)"
              value={formData.speed}
              type="number"
              onChange={(v) => handleChange("speed", v)}
              error={errors.speed}
              placeholder="e.g., 72"
            />

            {/* Temperature */}

            <InputField
              icon={<Thermometer size={16} />}
              label="Engine Temperature (°C)"
              value={formData.temperature}
              type="number"
              onChange={(v) => handleChange("temperature", v)}
              error={errors.temperature}
              placeholder="e.g., 88"
            />

            {/* Battery */}

            <InputField
              icon={<Battery size={16} />}
              label="Battery Level (%)"
              value={formData.battery}
              type="number"
              onChange={(v) => handleChange("battery", v)}
              error={errors.battery}
              placeholder="e.g., 67"
            />

            {/* Energy */}

            <InputField
              icon={<Zap size={16} />}
              label="Energy Consumption (kWh)"
              value={formData.energy}
              type="number"
              onChange={(v) => handleChange("energy", v)}
              error={errors.energy}
              placeholder="e.g., 4.3"
            />

            {/* Location */}

            <InputField
              icon={<MapPin size={16} />}
              label="Location"
              value={formData.location}
              onChange={(v) => handleChange("location", v)}
              error={errors.location}
              placeholder="e.g., Chennai"
            />

            {/* Submit */}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Saving..." : "Save Telemetry Data"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

/* Reusable Input Component */
type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  icon?: React.ReactNode
  type?: string
}

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  icon,
  type = "text",
}: InputFieldProps) {
  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
        {icon}
        <span>{label}</span>
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}