
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SCENARIOS, COLORS } from '../constants';

const Scenarios: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: COLORS.navy }}>Daily Scenarios</h2>
        <p className="text-slate-500 text-sm font-medium">Select a context to start an authentic conversation.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {SCENARIOS.map((scenario) => (
          <button 
            key={scenario.id}
            onClick={() => navigate('/practice', { state: { scenario } })}
            className="group flex items-center gap-5 bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-left hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div 
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-all shadow-sm group-hover:scale-110"
              style={{ backgroundColor: COLORS.accentBlue, color: COLORS.navy }}
            >
              <i className={`fa-solid ${scenario.icon}`}></i>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 tracking-widest">
                   {scenario.category}
                 </span>
              </div>
              <h3 className="font-bold text-lg leading-tight" style={{ color: COLORS.navy }}>{scenario.title}</h3>
              <p className="text-slate-400 text-xs line-clamp-1 font-medium mt-0.5">{scenario.description}</p>
            </div>

            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover:text-white group-hover:bg-[#B22234] transition-all">
               <i className="fas fa-arrow-right text-sm"></i>
            </div>
          </button>
        ))}
      </div>

      <div className="p-6 bg-slate-800 rounded-[2rem] text-white shadow-xl relative overflow-hidden mt-8">
        <div className="relative z-10">
          <h4 className="font-bold text-lg mb-1">Custom Scenario?</h4>
          <p className="text-white/60 text-xs mb-4">Go to free practice and talk about anything you want with Vic!</p>
          <button 
            onClick={() => navigate('/practice')}
            className="bg-[#B22234] px-6 py-2 rounded-full font-bold text-sm active:scale-95 transition-transform"
          >
            Start Free Talk
          </button>
        </div>
        <i className="fa-solid fa-comments absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12"></i>
      </div>
    </div>
  );
};

export default Scenarios;
