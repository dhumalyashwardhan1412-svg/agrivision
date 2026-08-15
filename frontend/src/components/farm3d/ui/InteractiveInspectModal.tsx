import React from 'react';
import { X, Sparkles, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { POIType } from '../state/useFarm3DStore';

interface InteractiveInspectModalProps {
  selectedPOI: POIType | null;
  onClose: () => void;
}

export const InteractiveInspectModal: React.FC<InteractiveInspectModalProps> = ({
  selectedPOI,
  onClose,
}) => {
  if (!selectedPOI) return null;

  const data = {
    CROP_FIELD: {
      title: 'Precision Tomato & Grain Fields',
      tag: 'CROP PHENOLOGY',
      description: '3.5 Acres segregated into high-density indeterminate hybrid tomatoes, premium durum wheat, wetland basmati paddy, and sweet corn.',
      metrics: [
        { label: 'Expected Yield', value: '18.5 Tonnes / Acre' },
        { label: 'NDVI Health', value: '0.86 (Prime)' },
        { label: 'Harvest Stage', value: '75% Maturity' },
        { label: 'Pest Risk', value: 'Low (Bio-trapped)' },
      ],
      insight: 'Drip fertigation with water-soluble 19:19:19 has enhanced fruit sizing by 22% compared to flood irrigation.',
    },
    SOIL: {
      title: 'Underground Soil Strata & Rhizosphere',
      tag: 'AGRONOMIC HORIZONS',
      description: '5-Layer Geological Horizon displaying organic topsoil, active root mycorrhizal colonization, NPK nutrient availability, and water holding table.',
      metrics: [
        { label: 'Soil pH', value: '6.8 (Neutral)' },
        { label: 'Nitrogen (N)', value: '245 kg/ha' },
        { label: 'Phosphorus (P)', value: '22.5 kg/ha' },
        { label: 'Potassium (K)', value: '195 kg/ha' },
      ],
      insight: 'Organic carbon at 0.78% provides superior cation-exchange capacity, reducing fertilizer leaching.',
    },
    IRRIGATION: {
      title: 'Automated Micro-Drip Irrigation Station',
      tag: 'SMART WATER MANAGEMENT',
      description: 'Pressure-compensating inline emitters spaced at 30cm along UV-stabilized lateral tubing. Saves 42% water over flood irrigation.',
      metrics: [
        { label: 'Operating Pressure', value: '2.4 Bar' },
        { label: 'Water Saved', value: '42,000 Liters' },
        { label: 'Flow Uniformity', value: '96.2%' },
        { label: 'Power Source', value: 'Solar Booster' },
      ],
      insight: 'Automated soil moisture sensors trigger fertigation pulses only when root zone moisture drops below 60%.',
    },
    TRACTOR: {
      title: 'Mahindra 45HP Precision Tractor & Harvester',
      tag: 'AGRICULTURAL MACHINERY',
      description: 'Equipped with GPS precision guidance, laser land leveler implement, rotavator, and detachable produce trolley for seamless field logistics.',
      metrics: [
        { label: 'Engine Power', value: '45 HP' },
        { label: 'Fuel Consumption', value: '3.2 L/hr' },
        { label: 'Custom Rental Rate', value: '₹850 / hr' },
        { label: 'Operational Status', value: 'Ready' },
      ],
      insight: 'Integrated telemetry connects tractor maintenance and custom hiring calendar directly to AgriVision Dealer hub.',
    },
    DRONE: {
      title: 'Autonomous Hexacopter Agri-Drone',
      tag: 'AERIAL MULTISPECTRAL LIDAR',
      description: 'Autonomous GPS waypoint survey platform carrying a 5-band multispectral sensor (Red, Green, Blue, Red-Edge, Near-Infrared).',
      metrics: [
        { label: 'Flight Speed', value: '18 km/h' },
        { label: 'Flight Altitude', value: '8.5 meters' },
        { label: 'Field Coverage', value: '10 Acres / hr' },
        { label: 'Resolution', value: '1.2 cm / px' },
      ],
      insight: 'Real-time early detection of foliar blight patches 5 days before visible to the naked human eye.',
    },
    WEATHER_STATION: {
      title: 'IoT Micro-Climate Telemetry Station',
      tag: 'METEOROLOGICAL SENSORS',
      description: 'Measures solar irradiance, relative humidity, ultrasonic wind velocity, ambient barometric pressure, and precipitation.',
      metrics: [
        { label: 'Air Temp', value: '28.5°C' },
        { label: 'Relative Humidity', value: '62%' },
        { label: 'Wind Speed', value: '12 km/h' },
        { label: 'Rain Forecast', value: 'Clear (48 hrs)' },
      ],
      insight: 'Local microclimate prediction prevents fungicide spray drift during high wind periods.',
    },
    FARMHOUSE: {
      title: 'Smart Farmhouse & Central Hub',
      tag: 'FARM ESTATE HQ',
      description: 'Modernized homestead equipped with LoRaWAN edge gateway, high-speed mesh networking, and living quarters.',
      metrics: [
        { label: 'Grid Power', value: 'Hybrid Solar' },
        { label: 'Network Range', value: '2.5 km LoRa' },
        { label: 'Sensor Hubs', value: '14 Connected' },
        { label: 'Security', value: 'AI Perimeter' },
      ],
      insight: 'Acts as the offline edge computing node for local sensor processing during rural broadband outages.',
    },
    GREENHOUSE: {
      title: 'Climate-Controlled Polyhouse Greenhouse',
      tag: 'PROTECTED CULTIVATION',
      description: 'High-tech climate-controlled tunnel with automated micro-misting, thermal shading screen, and LED growth spectrum lamps.',
      metrics: [
        { label: 'Internal Temp', value: '24.2°C Const.' },
        { label: 'Relative Humidity', value: '75% Regulated' },
        { label: 'Yield Multiplier', value: '3.4x Open Field' },
        { label: 'Off-Season Crop', value: 'Exotic Bell Pepper' },
      ],
      insight: 'Enables round-the-year premium off-season nursery sapling production and seed germination.',
    },
    SOLAR_PANELS: {
      title: '5kW Photovoltaic Renewable Solar Array',
      tag: 'CLEAN ENERGY HARVESTING',
      description: 'Bi-facial monocrystalline solar panels powering water pump motors, IoT edge gateways, and cold storage refrigeration.',
      metrics: [
        { label: 'Peak Capacity', value: '5.2 kWp' },
        { label: 'Daily Generation', value: '24.5 kWh' },
        { label: 'Inverter Efficiency', value: '98.2%' },
        { label: 'Carbon Offset', value: '8.4 Tonnes/yr' },
      ],
      insight: 'Generates 100% net-zero operational energy for daytime irrigation and battery storage.',
    },
    WATER_TANK: {
      title: 'Rainwater Storage & Reservoir Tank',
      tag: 'WATER CONSERVATION',
      description: '25,000-Liter galvanized corrugated steel reservoir connected to rooftop rainwater harvesting and solar deep well pump.',
      metrics: [
        { label: 'Storage Capacity', value: '25,000 Liters' },
        { label: 'Current Level', value: '88% Full' },
        { label: 'Recharge Pit', value: 'Active' },
        { label: 'Filtration', value: 'Dual Media Sand' },
      ],
      insight: 'Harvests 1.2 lakh liters of monsoon rainwater annually to recharge local groundwater aquifers.',
    },
  }[selectedPOI];

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-950/95 border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Tag */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            {data.tag}
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white mt-2">
            {data.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {data.metrics.map((m, i) => (
            <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {m.label}
              </span>
              <strong className="text-sm font-extrabold text-white mt-0.5 block">
                {m.value}
              </strong>
            </div>
          ))}
        </div>

        {/* Agronomy AI Advisory */}
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-400 font-bold block mb-0.5">AgriVision Twin Advisory:</strong>
            {data.insight}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition flex items-center justify-center gap-1.5"
        >
          <span>Resume Interactive 3D Farm</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
