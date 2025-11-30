import React, { useEffect, useState } from 'react';
import { StoreLocation, LoadingState } from '../types';
import { findHardwareStores } from '../services/geminiService';

interface ToolFinderProps {
  toolQuery: string;
}

const ToolFinder: React.FC<ToolFinderProps> = ({ toolQuery }) => {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
               const results = await findHardwareStores(latitude, longitude, toolQuery);
               setStores(results);
            } catch (e) {
               setError("Could not find stores. Try again later.");
            } finally {
              setLoading(false);
            }
          }, (err) => {
            setError("Location access needed to find nearby stores.");
            setLoading(false);
          });
        } else {
          setError("Geolocation not supported.");
          setLoading(false);
        }
      } catch (err) {
        setError("Something went wrong.");
        setLoading(false);
      }
    };

    fetchStores();
  }, [toolQuery]);

  return (
    <div className="flex flex-col h-full bg-walnut-dark relative">
      <div className="absolute inset-0 pegboard opacity-30 pointer-events-none"></div>
      
      <div className="p-6 relative z-10">
        <h2 className="text-2xl font-serif font-black text-ivory mb-6 border-b-4 border-ivory/20 pb-2">TOOL FINDER</h2>
        
        {/* AR Overlay Placeholder */}
        <div className="bg-graphite h-48 w-full rounded-lg mb-6 border-4 border-ivory/10 flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-black/50"></div>
           <p className="text-trust-blue font-mono text-sm mb-2 relative z-10 animate-pulse">● AR SCANNER ACTIVE</p>
           <p className="text-gray-400 text-xs text-center px-8 relative z-10">Point camera at your toolbox to find missing items</p>
           <div className="absolute bottom-2 right-2 text-6xl text-ivory/5">📷</div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-10">
            <div className="animate-spin h-10 w-10 border-4 border-ivory border-t-transparent rounded-full"></div>
            <p className="text-ivory font-mono text-sm">LOCATING SUPPLIERS...</p>
          </div>
        )}

        {error && (
          <div className="bg-warning-amber/20 border border-warning-amber p-4 rounded text-warning-amber font-mono text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {stores.map((store, idx) => (
              <div key={idx} className="bg-ivory p-4 rounded shadow-[4px_4px_0px_rgba(0,0,0,0.3)] flex justify-between items-center transform hover:translate-x-1 transition-transform">
                <div>
                  <h3 className="font-bold font-serif text-gray-800">{store.name}</h3>
                  <p className="text-xs font-mono text-gray-500 mt-1">{store.address}</p>
                </div>
                <a 
                  href={store.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-confidence-green text-white px-3 py-2 rounded font-bold text-sm hover:bg-green-600"
                >
                  GO
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolFinder;