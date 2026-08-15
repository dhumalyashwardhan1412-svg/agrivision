import React, { useState } from 'react';
import { Stethoscope, Camera, ShieldCheck, Sparkles, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CameraDropzone } from '../../components/camera/CameraDropzone';
import { DiagnosisResultCard } from '../../components/ai/DiagnosisResultCard';
import { aiApi } from '../../services/aiApi';
import { CropDiagnosis } from '../../types';

export const CropDoctor: React.FC = () => {
  const [cropHint, setCropHint] = useState<string>('Tomato');
  const [diagnosis, setDiagnosis] = useState<CropDiagnosis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleImageAnalysis = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await aiApi.analyzeCropLeaf(file, cropHint);
      setDiagnosis(result);
    } catch (err) {
      console.error('Diagnosis failure', err);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm">AI COMPUTER VISION DIAGNOSTIC CLINIC</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Crop Doctor & Disease Identification
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Capture or upload a photo of infected crop leaves to receive immediate pathogen identification, organic bio-treatments, and chemical spray dosages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-300">Crop Focus:</label>
          <select
            value={cropHint}
            onChange={(e) => setCropHint(e.target.value)}
            className="rounded-xl border border-purple-800 bg-purple-900/80 text-white px-3 py-2 text-xs font-bold"
          >
            <option value="Tomato">Tomato</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice / Paddy</option>
            <option value="Cotton">Cotton</option>
            <option value="Potato">Potato</option>
            <option value="Other">Other Field Crop</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Upload vs Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-4">
            <CardHeader>
              <div>
                <CardTitle className="text-base">Scan Crop Leaf / Foliage</CardTitle>
                <CardDescription>Position camera 10-15 cm from infected spot</CardDescription>
              </div>
            </CardHeader>

            <CameraDropzone
              onImageSelected={handleImageAnalysis}
              isLoading={isLoading}
              title="Capture Leaf or Fruit Photo"
              subtitle="Focus on spots, chlorosis, lesions, or wilting symptoms"
            />

            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl text-xs text-purple-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Diagnosis Capabilities:
              </span>
              <p className="text-purple-800 text-[11px] leading-relaxed">
                Identifies Early/Late Blight, Powdery Mildew, Rust, Leaf Curl Virus, Bacterial Blight, and Nutrient Chlorosis with confidence percentages.
              </p>
            </div>
          </Card>
        </div>

        {/* Diagnostic Output */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[400px]">
              <RefreshCw className="w-10 h-10 animate-spin text-purple-600" />
              <h4 className="font-bold text-slate-800">Processing Foliar Pathology...</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Analyzing leaf pigmentation, lesion geometry, and fungal spot patterns against Indian agricultural pathology databases.
              </p>
            </Card>
          ) : diagnosis ? (
            <DiagnosisResultCard diagnosis={diagnosis} />
          ) : (
            <Card className="p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center min-h-[400px]">
              <Stethoscope className="w-12 h-12 text-slate-300" />
              <h4 className="font-bold text-slate-700">Awaiting Crop Snapshot</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Take or upload a photo on the left to initiate the Computer Vision & Gemini Agronomy Diagnostic Engine.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
