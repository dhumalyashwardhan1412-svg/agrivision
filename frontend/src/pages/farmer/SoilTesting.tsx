import React, { useState, useEffect } from 'react';
import { FlaskConical, Camera, CheckCircle, AlertTriangle, Sparkles, Plus, Info, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { NPKBarChart } from '../../components/charts/NPKBarChart';
import { CameraDropzone } from '../../components/camera/CameraDropzone';
import { SoilObservationCard } from '../../components/ai/SoilObservationCard';
import { soilApi } from '../../services/soilApi';
import { farmApi } from '../../services/farmApi';
import { aiApi } from '../../services/aiApi';
import { SoilTest, SoilAnalysisResult, SoilObservation, Farm } from '../../types';
import { formatDate } from '../../utils/formatters';

export const SoilTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LAB' | 'IMAGE'>('LAB');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [soilHistory, setSoilHistory] = useState<SoilTest[]>([]);

  // Lab form state
  const [nitrogen, setNitrogen] = useState('245');
  const [phosphorus, setPhosphorus] = useState('22.5');
  const [potassium, setPotassium] = useState('195');
  const [ph, setPh] = useState('6.8');
  const [ec, setEc] = useState('0.48');
  const [oc, setOc] = useState('0.72');
  const [texture, setTexture] = useState('Loamy');
  const [labName, setLabName] = useState('District Agricultural Soil Testing Center');
  const [labResult, setLabResult] = useState<SoilTest | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SoilAnalysisResult | null>(null);
  const [isSubmittingLab, setIsSubmittingLab] = useState(false);

  // AI image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiObservation, setAiObservation] = useState<SoilObservation | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const loadData = async () => {
    try {
      const myFarms = await farmApi.getMyFarms();
      setFarms(myFarms);
      if (myFarms.length > 0) {
        const fId = myFarms[0].id;
        setSelectedFarmId(fId);
        const history = await soilApi.getSoilRecords(fId);
        setSoilHistory(history);
        if (history.length > 0) {
          setLabResult(history[0]);
          const analyzed = await soilApi.analyzeSoilTest(history[0].id);
          setAnalysisResult(analyzed);
        }
      }
    } catch (err) {
      console.error('Failed to load soil data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId) return;
    setIsSubmittingLab(true);
    try {
      const res = await soilApi.recordLabTest({
        farm_id: selectedFarmId,
        nitrogen: parseFloat(nitrogen) || 200,
        phosphorus: parseFloat(phosphorus) || 20,
        potassium: parseFloat(potassium) || 150,
        ph: parseFloat(ph) || 7.0,
        electrical_conductivity: parseFloat(ec) || 0.5,
        organic_carbon: parseFloat(oc) || 0.6,
        soil_texture: texture,
        lab_name: labName,
      });
      setLabResult(res);
      const analyzed = await soilApi.analyzeSoilTest(res.id);
      setAnalysisResult(analyzed);
      const history = await soilApi.getSoilRecords(selectedFarmId);
      setSoilHistory(history);
    } catch (err) {
      console.error('Lab test submission error', err);
      alert('Failed to save laboratory test');
    } finally {
      setIsSubmittingLab(false);
    }
  };

  const handleImageAnalysis = async (file: File) => {
    setImageFile(file);
    setIsAnalyzingImage(true);
    try {
      const obs = await aiApi.analyzeSoilPhoto(file, selectedFarmId || undefined);
      setAiObservation(obs);

      if (selectedFarmId) {
        await soilApi.recordImageEstimate({
          farm_id: selectedFarmId,
          image_url: obs.image_url,
          visual_color_tone: obs.visual_color_tone,
          visual_texture_notes: obs.estimated_soil_type,
          visual_moisture_level: obs.moisture_estimate,
        });
        const history = await soilApi.getSoilRecords(selectedFarmId);
        setSoilHistory(history);
      }
    } catch (err) {
      console.error('Soil image analysis failed', err);
      alert('Failed to process soil image. Please try again.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Soil Health Testing & Nutrient Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Certified chemical laboratory assay recording & on-field photographic visual screening.
          </p>
        </div>

        {farms.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Selected Farm:</span>
            <select
              value={selectedFarmId || ''}
              onChange={(e) => setSelectedFarmId(parseInt(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <Tabs
        tabs={[
          { id: 'LAB', label: 'Laboratory Soil Test (Chemical Assay)', icon: FlaskConical },
          { id: 'IMAGE', label: 'AI Visual Photo Screening', icon: Camera },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'LAB' | 'IMAGE')}
      />

      {activeTab === 'LAB' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lab Entry Form */}
          <Card className="p-6">
            <CardHeader>
              <div>
                <Badge variant="blue" size="sm">PRIMARY DATA SOURCE 1</Badge>
                <CardTitle className="mt-1">Enter Laboratory Test Values</CardTitle>
                <CardDescription>Values from your Soil Health Card / KVK testing lab</CardDescription>
              </div>
            </CardHeader>

            <form onSubmit={handleLabSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Nitrogen (N)"
                  type="number"
                  step="0.1"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                  helperText="Ideal: 280-560 kg/ha"
                  required
                />
                <Input
                  label="Phosphorus (P)"
                  type="number"
                  step="0.1"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                  helperText="Ideal: 10-25 kg/ha"
                  required
                />
                <Input
                  label="Potassium (K)"
                  type="number"
                  step="0.1"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  helperText="Ideal: 110-280 kg/ha"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Soil pH"
                  type="number"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  helperText="Neutral: 6.0-7.5"
                  required
                />
                <Input
                  label="EC (dS/m)"
                  type="number"
                  step="0.01"
                  value={ec}
                  onChange={(e) => setEc(e.target.value)}
                  helperText="Salinity index"
                />
                <Input
                  label="Organic Carbon (%)"
                  type="number"
                  step="0.01"
                  value={oc}
                  onChange={(e) => setOc(e.target.value)}
                  helperText="Target: > 0.75%"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Soil Texture</label>
                  <select
                    value={texture}
                    onChange={(e) => setTexture(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Black Cotton">Black Cotton</option>
                    <option value="Alluvial">Alluvial Silt</option>
                  </select>
                </div>
                <Input
                  label="Accredited Lab Name"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold"
                icon={FlaskConical}
                isLoading={isSubmittingLab}
              >
                Analyze & Save Laboratory Assay
              </Button>
            </form>
          </Card>

          {/* Real-time Analysis & NPK Balance Chart */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <div>
                  <Badge variant="green" size="sm">NPK BALANCE RADAR</Badge>
                  <CardTitle className="mt-1">Nutrient Levels vs Agronomic Optimum</CardTitle>
                </div>
                {labResult && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {labResult.health_grade}
                  </span>
                )}
              </CardHeader>

              <NPKBarChart
                nitrogen={parseFloat(nitrogen) || 245}
                phosphorus={parseFloat(phosphorus) || 22.5}
                potassium={parseFloat(potassium) || 195}
              />

              {analysisResult && (
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-800 block">NPK Status Interpretation:</span>
                    <p className="text-slate-600 font-medium">{labResult?.npk_status}</p>
                  </div>

                  {analysisResult.deficiencies.length > 0 && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-2xl space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Detected Nutrient Deficiencies:
                      </span>
                      <ul className="space-y-0.5 text-amber-800 list-disc list-inside">
                        {analysisResult.deficiencies.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.amendments_recommended.length > 0 && (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl space-y-1">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> Recommended Soil Amendments:
                      </span>
                      <ul className="space-y-0.5 text-emerald-800 list-disc list-inside">
                        {analysisResult.amendments_recommended.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* Image Estimation Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6">
              <CardHeader>
                <div>
                  <Badge variant="amber" size="sm">SOURCE 2: AI VISUAL SCREENING</Badge>
                  <CardTitle className="mt-1">Photographic Topsoil Observation</CardTitle>
                  <CardDescription>Provides qualitative visual observations of soil color, texture, and moisture</CardDescription>
                </div>
              </CardHeader>

              <CameraDropzone
                onImageSelected={handleImageAnalysis}
                isLoading={isAnalyzingImage}
                title="Capture or Upload Soil Photo"
                subtitle="Take a clean overhead photo of the topsoil under natural daylight"
              />

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Important Agronomic Rule:</strong> Photo analysis cannot determine chemical NPK parts-per-million or exact pH. It is visual screening only.
                </p>
              </div>
            </Card>
          </div>

          <div>
            {aiObservation ? (
              <SoilObservationCard observation={aiObservation} />
            ) : (
              <Card className="p-8 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center min-h-[350px]">
                <Camera className="w-12 h-12 text-slate-300" />
                <h4 className="font-bold text-slate-700">No Soil Image Scanned Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Upload a photo of your field topsoil to receive estimated color chroma, organic humus clues, and moisture analysis.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Historical Records Table */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-base">Soil Records History ({soilHistory.length})</CardTitle>
          <CardDescription>Verified laboratory tests and visual screening records</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Source Type</th>
                <th className="py-3 px-4">N-P-K (kg/ha)</th>
                <th className="py-3 px-4">pH</th>
                <th className="py-3 px-4">Organic Carbon</th>
                <th className="py-3 px-4">Health Grade</th>
                <th className="py-3 px-4">Lab / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {soilHistory.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">{formatDate(s.created_at)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={s.source_type === 'LABORATORY' ? 'blue' : 'amber'} size="sm">
                      {s.source_type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {s.source_type === 'LABORATORY' ? `${s.nitrogen}-${s.phosphorus}-${s.potassium}` : 'Visual Screening'}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">{s.ph || '6.8 (Est.)'}</td>
                  <td className="py-3 px-4 font-mono">{s.organic_carbon ? `${s.organic_carbon}%` : 'Moderate'}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-700">{s.health_grade}</span>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-500">{s.lab_name || s.visual_texture_notes || s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
