
import React from 'react';
import { UserProfile, UserLevel } from '../types';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants';

interface HomeProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const Home: React.FC<HomeProps> = ({ profile, setProfile }) => {
  const toggleLevel = () => {
    const levels = Object.values(UserLevel);
    const currentIndex = levels.indexOf(profile.level);
    const nextIndex = (currentIndex + 1) % levels.length;
    setProfile(prev => ({ ...prev, level: levels[nextIndex] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] p-6 rounded-3xl text-white shadow-lg animate-in zoom-in-95">
        <h2 className="text-2xl font-bold mb-1">Welcome Back, {profile.name.split(' ')[0]}! 👋</h2>
        <p className="opacity-80 text-sm">Ready to crush your goals today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <i className="fas fa-star text-amber-400 text-3xl mb-2"></i>
          <span className="text-2xl font-bold">{profile.stats.totalStars}</span>
          <span className="text-slate-500 text-[9px] uppercase tracking-widest font-black">Total Stars</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <i className="fas fa-fire text-orange-500 text-3xl mb-2"></i>
          <span className="text-2xl font-bold">{profile.stats.dayStreak}</span>
          <span className="text-slate-500 text-[9px] uppercase tracking-widest font-black">Day Streak</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <i className="fas fa-seedling text-blue-500 text-xl"></i>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Current Level</p>
            <h3 className="text-lg font-black" style={{ color: COLORS.navy }}>{profile.level}</h3>
          </div>
        </div>
        <button 
          onClick={toggleLevel}
          className="w-full text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95 shadow-md"
          style={{ backgroundColor: COLORS.navy }}
        >
          Level Up
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="font-black text-slate-800 ml-2 uppercase text-[10px] tracking-[0.2em]">Quick Actions</h4>
        <Link to="/scenarios" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-transform group">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <i className="fas fa-list"></i>
          </div>
          <span className="font-bold flex-1 text-sm">Browse Scenarios</span>
          <i className="fas fa-chevron-right text-slate-300"></i>
        </Link>
        <Link to="/practice" className="flex items-center gap-4 bg-[#22c55e] text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="fas fa-microphone"></i>
          </div>
          <span className="font-black flex-1 text-sm uppercase tracking-widest">Start Speaking</span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <i className="fas fa-play text-[10px]"></i>
          </div>
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-5 rounded-[2rem] flex items-start gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-white text-xs flex-shrink-0">
          <i className="fas fa-lightbulb"></i>
        </div>
        <p className="text-amber-900 text-xs leading-relaxed font-bold italic">
          "Focus on your {profile.interests[0] || 'English'} goals today, {profile.name.split(' ')[0]}!"
        </p>
      </div>
    </div>
  );
};

export default Home;
