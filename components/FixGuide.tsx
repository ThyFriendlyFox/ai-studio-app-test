import React, { useState } from 'react';
import { FixPlan, LoadingState } from '../types';

interface FixGuideProps {
  plan: FixPlan;
  onGenerateImage: (stepIndex: number, prompt: string) => void;
  loadingState: LoadingState;
  onFindTools: () => void;
}

const FixGuide: React.FC<FixGuideProps> = ({ plan, onGenerateImage, loadingState, onFindTools }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleComplete = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter(i => i !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
    }
  };

  // Safe checks for arrays
  const steps = plan.steps || [];
  const tools = plan.tools || [];
  
  const progress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-walnut relative">
      {/* Texture Overlay */}
      <div className="absolute inset-0 texture-grain z-0"></div>

      {/* Clipboard Header */}
      <div className="relative z-10 p-4 pb-0">
        <div className="bg-paper rounded-t-xl shadow-2xl p-6 border-t-8 border-gray-300 relative mx-2">
           {/* Clipboard Clip */}
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-12 bg-gray-300 rounded-t-lg shadow-md flex items-center justify-center">
              <div className="w-24 h-4 bg-gray-400 rounded-full"></div>
           </div>

          <div className="flex justify-between items-start mb-4 pt-2">
            <h2 className="text-3xl font-serif font-black text-gray-800 leading-none w-3/4">{plan.title}</h2>
            <div className={`px-2 py-1 border-2 font-mono text-xs font-bold uppercase tracking-widest
              ${plan.difficulty === 'Easy' ? 'border-confidence-green text-confidence-green' : 'border-warning-amber text-warning-amber'}`}>
              {plan.difficulty}
            </div>
          </div>
          
          <div className="flex gap-4 text-sm font-mono text-gray-600 border-b-2 border-dashed border-gray-200 pb-4 mb-4">
            <span className="flex items-center gap-1">⏱ {plan.estimatedTime}</span>
            <span className="flex items-center gap-1 text-warning-amber">⚠ {plan.safetyWarning}</span>
          </div>

          {/* Tools needed (Mini view) */}
          <div className="flex justify-between items-center bg-ivory p-3 rounded border border-gray-200 mb-2" onClick={onFindTools}>
             <div className="flex -space-x-2 overflow-hidden">
                {tools.slice(0,4).map((t,i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs" title={t.name}>🔧</div>
                ))}
                {tools.length > 4 && <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">+{tools.length - 4}</div>}
             </div>
             <button className="text-xs font-bold text-trust-blue uppercase tracking-wider">Get Tools &rarr;</button>
          </div>
        </div>
      </div>

      {/* Scrollable Steps Area (The 'Workbench' Surface) */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-6 pt-4 relative z-10 no-scrollbar">
        
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className="perspective-1000 group cursor-pointer"
            onClick={() => setActiveStep(idx)}
          >
            <div className={`
              relative transition-all duration-500 transform-style-3d
              ${completedSteps.includes(idx) ? 'rotate-y-180' : ''}
            `}>
              
              {/* Front of Card (Active/Pending) */}
              <div className={`
                backface-hidden bg-white p-5 rounded-sm shadow-md border-l-8 transition-transform
                ${activeStep === idx ? 'scale-105 border-confidence-green z-20 shadow-xl' : 'scale-100 border-gray-300 opacity-90'}
              `}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-gray-400 text-sm">STEP {String(step.stepNumber).padStart(2, '0')}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleComplete(idx); }}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-confidence-green"
                  ></button>
                </div>
                <h4 className="font-serif font-bold text-lg text-gray-800 mb-2">{step.instruction}</h4>
                
                {activeStep === idx && (
                  <>
                    <p className="text-gray-600 text-sm leading-relaxed font-sans mb-4">{step.detail}</p>
                    
                    {/* Visual Area */}
                    <div className="bg-ivory border-2 border-dashed border-gray-200 rounded p-2 min-h-[160px] flex flex-col items-center justify-center relative">
                       {step.generatedImageUrl ? (
                          <img src={step.generatedImageUrl} alt="Diagram" className="w-full h-full object-contain mix-blend-multiply" />
                       ) : (
                         <div className="text-center p-2">
                            <p className="font-mono text-xs text-gray-400 mb-3">"{step.visualPrompt}"</p>
                            <button
                              onClick={() => onGenerateImage(idx, step.visualPrompt)}
                              disabled={loadingState === LoadingState.GENERATING_IMAGE}
                              className="px-4 py-2 bg-white border-2 border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs font-bold uppercase tracking-widest hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all"
                            >
                              {loadingState === LoadingState.GENERATING_IMAGE ? 'Sketching...' : 'Show Me How'}
                            </button>
                         </div>
                       )}
                    </div>
                  </>
                )}
              </div>

              {/* Back of Card (Completed) */}
              <div className={`
                absolute inset-0 backface-hidden rotate-y-180 bg-paper p-5 rounded-sm shadow-sm border-l-8 border-gray-300 flex flex-col items-center justify-center
                opacity-60 grayscale
              `}>
                <div 
                   onClick={(e) => { e.stopPropagation(); toggleComplete(idx); }}
                   className="text-confidence-green text-6xl rotate-12 handwritten"
                >
                  ✓
                </div>
                <span className="font-mono text-xs text-gray-400 mt-2">DONE</span>
              </div>
            </div>
          </div>
        ))}

        {/* Completion State */}
        {steps.length > 0 && completedSteps.length === steps.length && (
           <div className="bg-confidence-green text-white p-8 rounded-lg shadow-2xl text-center animate-clunk transform border-4 border-white border-dashed">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="font-serif font-black text-2xl mb-2">NAILED IT!</h3>
              <p className="font-mono text-sm opacity-90">Job done. Feels good, right?</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default FixGuide;
