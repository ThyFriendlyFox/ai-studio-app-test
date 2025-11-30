import React, { useState, useRef } from 'react';
import { blobToBase64 } from '../services/geminiService';
import { LoadingState } from '../types';

interface ScannerProps {
  onAnalyze: (text: string, imageBase64?: string) => void;
  loadingState: LoadingState;
}

const Scanner: React.FC<ScannerProps> = ({ onAnalyze, loadingState }) => {
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await blobToBase64(file);
      setPreview(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !preview) return;
    onAnalyze(description, preview || undefined);
  };

  return (
    <div className="flex flex-col h-full bg-graphite relative overflow-hidden">
      {/* HUD Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(124,179,66,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,179,66,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-serif font-black text-ivory mb-2 tracking-wide">ISSUE SCANNER</h2>
          <p className="text-gray-400 font-mono text-sm">ALIGN PROBLEM IN FRAME</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 w-full max-w-md mx-auto">
          
          {/* Viewfinder Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex-1 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
              border-2 ${preview ? 'border-confidence-green' : 'border-ivory/30 hover:border-ivory/60'}
            `}
          >
             {/* Bounding Box Corners */}
             <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-confidence-green"></div>
             <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-confidence-green"></div>
             <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-confidence-green"></div>
             <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-confidence-green"></div>

            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover opacity-90" />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-dashed border-ivory/20 rounded-full flex items-center justify-center mb-4 text-ivory/50 text-3xl">
                  +
                </div>
                <span className="text-ivory font-mono text-sm tracking-widest">TAP TO CAPTURE</span>
              </div>
            )}
            
            {/* Live Scan Line Animation */}
            {loadingState === LoadingState.ANALYZING && (
               <div className="absolute inset-0 bg-confidence-green/10 animate-flash z-20"></div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Manual Input Panel */}
          <div className="bg-walnut-dark/90 p-4 rounded-sm border-t-4 border-walnut backdrop-blur-sm">
            <div className="relative mb-4">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Or describe it (e.g. 'Leaky Tap')"
                className="w-full bg-graphite border border-gray-600 rounded-none px-4 py-3 text-ivory focus:ring-1 focus:ring-confidence-green focus:outline-none font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loadingState !== LoadingState.IDLE || (!description && !preview)}
              className={`
                w-full py-4 font-black font-serif text-xl tracking-wider shadow-xl border-b-4 active:border-b-0 active:translate-y-1 transition-all
                ${loadingState !== LoadingState.IDLE 
                  ? 'bg-gray-600 text-gray-400 border-gray-800 cursor-wait' 
                  : 'bg-confidence-green text-white border-green-800 hover:bg-green-600'}
              `}
            >
              {loadingState === LoadingState.ANALYZING ? 'PROCESSING...' : 'DIAGNOSE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Scanner;