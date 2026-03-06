import { useState } from "react"
import type { FormEvent } from "react"
import { apiService } from "../services/api"
import {
  Car,
  Gauge,
  Thermometer,
  Battery,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function AddTelemetry() {

  const [formData, setFormData] = useState({
    vehicleId: "",

    engine_rpm: "",
    rpm: "",

    lub_oil_pressure: "",
    oil_pressure: "",

    fuel_pressure: "",
    coolant_pressure: "",

    lub_oil_temp: "",
    coolant_temp: "",
    engine_temp: "",

    battery_voltage: "",

    mileage: "",
    vibration_level: "",
    fuel_efficiency: "",

    coolant_level: "",
    ambient_temperature: "",

    error_codes_count: ""
  })

  const [errors, setErrors] = useState<Record<string,string>>({})
  const [showSuccess,setShowSuccess] = useState(false)
  const [showError,setShowError] = useState(false)
  const [errorMessage,setErrorMessage] = useState("")
  const [isLoading,setIsLoading] = useState(false)


  const validateForm = () => {

    const newErrors:Record<string,string> = {}

    if(!formData.vehicleId.trim()){
      newErrors.vehicleId = "Vehicle ID required"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }


  const handleSubmit = async (e:FormEvent) => {

    e.preventDefault()

    if(!validateForm()) return

    setIsLoading(true)

    try{

      const payload:any = {
        vehicleId: formData.vehicleId.trim()
      }

      Object.entries(formData).forEach(([k,v])=>{
        if(k==="vehicleId") return

        if(v!=="" && !isNaN(Number(v))){
          payload[k] = Number(v)
        }
      })

      await apiService.ingestTelemetry(payload)

      setShowSuccess(true)
      setTimeout(()=>setShowSuccess(false),3000)

      setFormData({
        vehicleId:"",
        engine_rpm:"",
        rpm:"",
        lub_oil_pressure:"",
        oil_pressure:"",
        fuel_pressure:"",
        coolant_pressure:"",
        lub_oil_temp:"",
        coolant_temp:"",
        engine_temp:"",
        battery_voltage:"",
        mileage:"",
        vibration_level:"",
        fuel_efficiency:"",
        coolant_level:"",
        ambient_temperature:"",
        error_codes_count:""
      })

    }
    catch(error){

      setErrorMessage(
        error instanceof Error
        ? error.message
        : "Failed to save telemetry"
      )

      setShowError(true)

    }
    finally{
      setIsLoading(false)
    }

  }


  const handleChange = (field:string,value:string)=>{

    setFormData(prev=>({
      ...prev,
      [field]:value
    }))

  }


  return (

  <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">

  <div className="container mx-auto max-w-3xl">


  {showSuccess && (
  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
  <CheckCircle className="text-green-600"/>
  <p className="text-green-800 font-medium">Telemetry saved</p>
  </div>
  )}

  {showError && (
  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
  <AlertCircle className="text-red-600"/>
  <p className="text-red-800 font-medium">{errorMessage}</p>
  </div>
  )}


  <div className="bg-white rounded-2xl shadow-xl p-8">

  <div className="flex items-center space-x-3 mb-6">
  <div className="bg-blue-100 p-3 rounded-lg">
  <Car className="text-blue-600"/>
  </div>
  <div>
  <h1 className="text-3xl font-bold text-gray-800">
  Add Telemetry
  </h1>
  </div>
  </div>


  <form onSubmit={handleSubmit} className="space-y-4">

  <InputField
  label="Vehicle ID"
  value={formData.vehicleId}
  onChange={(v)=>handleChange("vehicleId",v)}
  error={errors.vehicleId}
  icon={<Car size={16}/>}
  />


  <InputField label="Engine RPM" value={formData.engine_rpm} type="number" onChange={(v)=>handleChange("engine_rpm",v)} icon={<Gauge size={16}/>}/>
  <InputField label="RPM" value={formData.rpm} type="number" onChange={(v)=>handleChange("rpm",v)}/>

  <InputField label="Lube Oil Pressure" value={formData.lub_oil_pressure} type="number" onChange={(v)=>handleChange("lub_oil_pressure",v)}/>
  <InputField label="Oil Pressure" value={formData.oil_pressure} type="number" onChange={(v)=>handleChange("oil_pressure",v)}/>

  <InputField label="Fuel Pressure" value={formData.fuel_pressure} type="number" onChange={(v)=>handleChange("fuel_pressure",v)}/>
  <InputField label="Coolant Pressure" value={formData.coolant_pressure} type="number" onChange={(v)=>handleChange("coolant_pressure",v)}/>

  <InputField label="Lube Oil Temp" value={formData.lub_oil_temp} type="number" onChange={(v)=>handleChange("lub_oil_temp",v)} icon={<Thermometer size={16}/>}/>
  <InputField label="Coolant Temp" value={formData.coolant_temp} type="number" onChange={(v)=>handleChange("coolant_temp",v)}/>
  <InputField label="Engine Temp" value={formData.engine_temp} type="number" onChange={(v)=>handleChange("engine_temp",v)}/>

  <InputField label="Battery Voltage" value={formData.battery_voltage} type="number" onChange={(v)=>handleChange("battery_voltage",v)} icon={<Battery size={16}/>}/>

  <InputField label="Mileage" value={formData.mileage} type="number" onChange={(v)=>handleChange("mileage",v)}/>
  <InputField label="Vibration Level" value={formData.vibration_level} type="number" onChange={(v)=>handleChange("vibration_level",v)}/>
  <InputField label="Fuel Efficiency" value={formData.fuel_efficiency} type="number" onChange={(v)=>handleChange("fuel_efficiency",v)}/>

  <InputField label="Coolant Level" value={formData.coolant_level} type="number" onChange={(v)=>handleChange("coolant_level",v)}/>
  <InputField label="Ambient Temperature" value={formData.ambient_temperature} type="number" onChange={(v)=>handleChange("ambient_temperature",v)}/>

  <InputField label="Error Codes Count" value={formData.error_codes_count} type="number" onChange={(v)=>handleChange("error_codes_count",v)}/>


  <button
  type="submit"
  disabled={isLoading}
  className={`w-full py-3 rounded-lg font-semibold ${
  isLoading
  ? "bg-gray-400"
  : "bg-blue-600 text-white hover:bg-blue-700"
  }`}
  >
  {isLoading ? "Saving..." : "Save Telemetry"}
  </button>

  </form>

  </div>

  </div>
  </div>
  )

}



type InputFieldProps = {
label:string
value:string
onChange:(v:string)=>void
error?:string
placeholder?:string
icon?:React.ReactNode
type?:string
}

function InputField({
label,
value,
onChange,
error,
placeholder,
icon,
type="text"
}:InputFieldProps){

return(

<div>

<label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
{icon}
<span>{label}</span>
</label>

<input
type={type}
value={value}
onChange={(e)=>onChange(e.target.value)}
placeholder={placeholder}
className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
error ? "border-red-500" : "border-gray-300"
}`}
 />

{error && (
<p className="text-red-500 text-sm mt-1">{error}</p>
)}

</div>

)

}