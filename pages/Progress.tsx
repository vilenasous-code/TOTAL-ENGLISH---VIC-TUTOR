
import React from 'react';
// Fixed: Removed non-existent 'Badge' from imports
import { UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../constants';

const MOCK_FLUENCY_DATA = [
  { week: 'W1', score: 0 },
  { week: 'W2', score: 0 },
  { week: 'W3', score: 0 },
  { week: 'W4', score: 0 },
  { week: 'W5', score: 0 },
  { week: 'W6', score: 0 },
];

const Progress: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold" style={{ color: COLORS.navy }}>Your Fluency Journey</h2>
        <p className="text-slate-500 text-sm font-medium">Tracking your improvements from Day 1.</p>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.navy }}>
          <i className="fas fa-chart-line" style={{ color: COLORS.red }}></i>
          Fluency Score (Progress)
        </h3>
        <div className="h-48 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Start practicing to see data!</p>
        </div>
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
             <span className="text-slate-400">Current Level Proficiency</span>
             <span style={{ color: COLORS.navy }}>{profile.stats.totalStars > 0 ? '5%' : '0%'}</span>
           </div>
           <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
             <div className="h-full transition-all duration-1000" style={{ width: profile.stats.totalStars > 0 ? '5%' : '0%', backgroundColor: COLORS.navy }}></div>
           </div>
        </div>
      </div>

      <div className="bg-[#001529] p-6 rounded-3xl text-white shadow-lg text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
           <i className="fas fa-award text-6xl"></i>
         </div>
         <i className="fas fa-file-invoice text-3xl mb-3 text-amber-400"></i>
         <h3 className="text-xl font-bold mb-2">Weekly Fluency Report</h3>
         <p className="text-white/70 text-sm mb-4">Complete 5 conversations to unlock your first professional fluency report.</p>
         <button className="w-full bg-white text-[#001529] py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50" disabled>
           <i className="fas fa-lock"></i>
           Locked
         </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold mb-3" style={{ color: COLORS.navy }}>Neuro-learning Insights</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Vic AI is analyzing your patterns. The more you speak, the better she understands your neural paths for English fluency!
        </p>
      </div>
    </div>
  );
};

export default Progress;
