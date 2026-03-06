import { useState, } from 'react';
import type {FormEvent} from 'react';
import { apiService } from '../services/api';
import { Car, Gauge, Thermometer, Battery, Zap, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function AddTelemetry() {
  const [formData, setFormData] = useState({
    vehicleId: '',
    speed: '',
    temperature: '',
    battery: '',
    energy: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId.trim()) {
      newErrors.vehicleId = 'Vehicle ID is required';
    }

    if (!formData.speed || Number(formData.speed) < 0) {
      newErrors.speed = 'Valid speed is required';
    }

    if (!formData.temperature || Number(formData.temperature) < -50 || Number(formData.temperature) > 200) {
      newErrors.temperature = 'Temperature must be between -50°C and 200°C';
    }

    if (!formData.battery || Number(formData.battery) < 0 || Number(formData.battery) > 100) {
      newErrors.battery = 'Battery must be between 0% and 100%';
    }

    if (!formData.energy || Number(formData.energy) < 0) {
      newErrors.energy = 'Valid energy consumption is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setShowError(false);

    try {
      // Send to API
      await apiService.ingestTelemetry({
        vehicleId: formData.vehicleId.trim(),
        speed: Number(formData.speed),
        temperature: Number(formData.temperature),
        battery: Number(formData.battery),
        energy: Number(formData.energy),
        location: formData.location.trim(),
      });

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Clear form
      setFormData({
        vehicleId: '',
        speed: '',
        temperature: '',
        battery: '',
        energy: '',
        location: '',
      });
      setErrors({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save telemetry data');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-medium">Telemetry data saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Add Telemetry Data</h1>
              <p className="text-gray-600">Enter vehicle operational metrics</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle ID */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Car className="w-4 h-4" />
                <span>Vehicle ID</span>
              </label>
              <input
                type="text"
                value={formData.vehicleId}
                onChange={(e) => handleChange('vehicleId', e.target.value)}
                placeholder="e.g., VEH-102"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.vehicleId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.vehicleId && <p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>}
            </div>

            {/* Speed */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Gauge className="w-4 h-4" />
                <span>Speed (km/h)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.speed}
                onChange={(e) => handleChange('speed', e.target.value)}
                placeholder="e.g., 72"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.speed ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.speed && <p className="text-red-500 text-sm mt-1">{errors.speed}</p>}
            </div>

            {/* Engine Temperature */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Thermometer className="w-4 h-4" />
                <span>Engine Temperature (°C)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                placeholder="e.g., 88"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.temperature ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>}
            </div>

            {/* Battery Level */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Battery className="w-4 h-4" />
                <span>Battery Level (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.battery}
                onChange={(e) => handleChange('battery', e.target.value)}
                placeholder="e.g., 67"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.battery ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.battery && <p className="text-red-500 text-sm mt-1">{errors.battery}</p>}
            </div>

            {/* Energy Consumption */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Zap className="w-4 h-4" />
                <span>Energy Consumption (kWh)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.energy}
                onChange={(e) => handleChange('energy', e.target.value)}
                placeholder="e.g., 4.3"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.energy ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.energy && <p className="text-red-500 text-sm mt-1">{errors.energy}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Chennai"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Save Telemetry Data
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
