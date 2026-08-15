import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, RefreshCw, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface CameraDropzoneProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

export const CameraDropzone: React.FC<CameraDropzoneProps> = ({
  onImageSelected,
  isLoading = false,
  title = 'Upload or Capture Crop Photo',
  subtitle = 'Take a clear close-up of the leaf, disease spot, or topsoil surface',
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error', err);
      alert('Unable to access device camera. Please check browser permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `crop_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          setPreview(url);
          setSelectedFile(file);
          onImageSelected(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.92);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
      setSelectedFile(file);
      onImageSelected(file);
    }
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center transition-all hover:border-agri-400">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {isCameraActive ? (
        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" icon={Camera} onClick={capturePhoto}>
              Capture Snapshot
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      ) : preview ? (
        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-slate-200 group">
            <img src={preview} alt="Crop preview" className="w-full h-full object-cover" />
            <button
              onClick={clearSelection}
              className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span>Image loaded: {selectedFile?.name || 'Captured Photo'}</span>
          </div>
        </div>
      ) : (
        <div className="text-center max-w-sm space-y-4 py-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-agri-50 border border-agri-100 flex items-center justify-center text-agri-700 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">{title}</h4>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={ImageIcon}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Camera}
              onClick={startCamera}
            >
              Open Camera
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP up to 10MB</p>
        </div>
      )}
    </div>
  );
};
