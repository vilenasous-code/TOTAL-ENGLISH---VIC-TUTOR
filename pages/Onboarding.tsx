
import React, { useState } from 'react';
import { UserProfile, UserLevel } from '../types';
import { COLORS } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ageGroup: '18-25',
    interests: [] as string[]
  });
  const [micStatus, setMicStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const categories = [
    {
      title: "Professional & Tech 💼",
      options: [
        { id: 'business', label: 'Business & Careers', icon: 'fa-briefcase' },
        { id: 'tech', label: 'Technology & AI', icon: 'fa-laptop-code' },
        { id: 'startup', label: 'Entrepreneurship', icon: 'fa-rocket' }
      ]
    },
    {
      title: "Lifestyle & Travel 🌍",
      options: [
        { id: 'travel', label: 'Travel & Tourism', icon: 'fa-plane' },
        { id: 'food', label: 'Gastronomy', icon: 'fa-utensils' },
        { id: 'health', label: 'Health & Wellness', icon: 'fa-heart-pulse' }
      ]
    },
    {
      title: "Entertainment & Culture 🎨",
      options: [
        { id: 'movies', label: 'Movies & Series', icon: 'fa-film' },
        { id: 'music', label: 'Music & Arts', icon: 'fa-music' },
        { id: 'history', label: 'Literature & History', icon: 'fa-book-open' }
      ]
    }
  ];

  const handleToggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id) 
        ? prev.interests.filter(i => i !== id) 
        : [...prev.interests, id]
    }));
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicStatus('granted');
    } catch (e) {
      setMicStatus('denied');
    }
  };

  const handleFinish = async () => {
    const finalProfile: UserProfile = {
      name: formData.name || 'Champion',
      email: formData.email,
      ageGroup: formData.ageGroup,
      interests: formData.interests,
      level: UserLevel.BEGINNER,
      stats: { totalStars: 0, dayStreak: 0, totalConversations: 0 },
      onboarded: true,
      weakPoints: [],
      badges: []
    };
    onComplete(finalProfile);
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col p-6 animate-in fade-in duration-500 overflow-y-auto scrollbar-hide">
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-8 pt-4 max-w-md mx-auto w-full">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step >= s ? 'text-white' : 'text-slate-300 bg-slate-100'
              }`}
              style={step >= s ? { backgroundColor: COLORS.navy } : {}}
            >
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 mx-2 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`}></div>}
          </div>
        ))}
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h1 className="text-3xl font-black mb-2" style={{ color: COLORS.navy }}>Welcome!</h1>
              <p className="text-slate-500 text-sm">Let's start by getting to know you a little better. 👋</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">What's your name?</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-300 transition-all font-medium"
                  placeholder="Ex: John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-mail</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-300 transition-all font-medium"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Age Group</label>
                <select 
                  value={formData.ageGroup}
                  onChange={e => setFormData({...formData, ageGroup: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-medium"
                >
                  <option value="under-18">Under 18</option>
                  <option value="18-25">18 - 25 years</option>
                  <option value="26-35">26 - 35 years</option>
                  <option value="36-50">36 - 50 years</option>
                  <option value="50+">50+ years</option>
                </select>
              </div>
            </div>
            
            <button 
              disabled={!formData.name || !formData.email}
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-30"
              style={{ backgroundColor: COLORS.navy }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h1 className="text-3xl font-black mb-2" style={{ color: COLORS.navy }}>Your Interests</h1>
              <p className="text-slate-500 text-sm">We'll personalize Vic's conversations based on these topics. 🚀</p>
            </div>

            <div className="space-y-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{cat.title}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {cat.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleToggleInterest(opt.id)}
                        className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-[0.98] ${
                          formData.interests.includes(opt.id) 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                            : 'border-slate-50 bg-slate-50 text-slate-500'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${formData.interests.includes(opt.id) ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}>
                          <i className={`fas ${opt.icon}`}></i>
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">{opt.label}</span>
                        {formData.interests.includes(opt.id) && <i className="fas fa-check-circle ml-auto"></i>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 py-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-xs">Back</button>
              <button 
                disabled={formData.interests.length === 0}
                onClick={() => setStep(3)}
                className="flex-[2] py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-30"
                style={{ backgroundColor: COLORS.navy }}
              >
                Set Goals
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h1 className="text-3xl font-black mb-2" style={{ color: COLORS.navy }}>Final Step!</h1>
              <p className="text-slate-500 text-sm">Let's connect your voice and secure your access. ✨</p>
            </div>

            <div className="space-y-4">
              <div className={`p-6 rounded-[2rem] border transition-all flex items-center gap-4 ${micStatus === 'granted' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${micStatus === 'granted' ? 'bg-green-500 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>
                  <i className={`fas ${micStatus === 'granted' ? 'fa-check' : 'fa-microphone'}`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Voice Access</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Enable Microphone</p>
                </div>
                {micStatus !== 'granted' && (
                  <button onClick={requestMic} className="px-4 py-2 bg-white rounded-full text-[10px] font-black shadow-sm border border-slate-100 hover:border-blue-300">Allow</button>
                )}
              </div>

              <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-xl">
                  <i className="fas fa-key"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-amber-900">Vic Connection</h4>
                  <p className="text-[10px] text-amber-700/60 uppercase font-black">Secure API Access</p>
                </div>
                <button 
                  onClick={() => window.aistudio?.openSelectKey()} 
                  className="px-4 py-2 bg-white rounded-full text-[10px] font-black text-amber-600 shadow-sm border border-amber-100 hover:bg-amber-100 transition-colors"
                >
                  Connect
                </button>
              </div>
              <div className="text-center">
                <a 
                  href="https://ai.google.dev/gemini-api/docs/api-key" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-slate-400 uppercase underline hover:text-blue-600 transition-colors"
                >
                  Don't have a key? Get yours here
                </a>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={micStatus !== 'granted'}
                onClick={handleFinish}
                className="w-full py-5 rounded-3xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-30"
                style={{ backgroundColor: COLORS.red }}
              >
                Start Learning Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
