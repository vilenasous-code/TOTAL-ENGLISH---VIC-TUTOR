
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Scenarios from './pages/Scenarios';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Onboarding from './pages/Onboarding';
import { UserLevel, UserProfile } from './types';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('total_english_profile');
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('total_english_profile', JSON.stringify(profile));
  };

  const updateStats = (stars: number) => {
    if (!userProfile) return;
    const newProfile = {
      ...userProfile,
      stats: {
        ...userProfile.stats,
        totalStars: userProfile.stats.totalStars + stars,
        totalConversations: userProfile.stats.totalConversations + 1,
        dayStreak: userProfile.stats.dayStreak === 0 ? 1 : userProfile.stats.dayStreak
      }
    };
    setUserProfile(newProfile);
    localStorage.setItem('total_english_profile', JSON.stringify(newProfile));
  };

  if (loading) return null;

  if (!userProfile || !userProfile.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-20">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: COLORS.navy }}>TE</div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: COLORS.navy }}>Total <span style={{ color: COLORS.red }}>English</span></h1>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            <i className="fas fa-star text-amber-500"></i>
            <span className="font-black text-amber-700">{userProfile.stats.totalStars}</span>
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full p-4">
          <Routes>
            <Route path="/" element={<Home profile={userProfile} setProfile={(p) => {
              const updated = typeof p === 'function' ? (p as any)(userProfile) : p;
              setUserProfile(updated);
              localStorage.setItem('total_english_profile', JSON.stringify(updated));
            }} />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/practice" element={<Practice profile={userProfile} onFinishConversation={updateStats} />} />
            <Route path="/progress" element={<Progress profile={userProfile} />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
          <NavLink to="/" icon="fa-home" label="Home" />
          <NavLink to="/scenarios" icon="fa-layer-group" label="Context" />
          <NavLink to="/practice" icon="fa-comment-dots" label="Speak" />
          <NavLink to="/progress" icon="fa-chart-simple" label="Stats" />
        </nav>
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center p-1 transition-all ${isActive ? 'scale-110 opacity-100' : 'opacity-30'}`} style={{ color: COLORS.navy }}>
      <i className={`fas ${icon} text-xl mb-1`}></i>
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
      {isActive && <div className="w-4 h-1 rounded-full mt-1 bg-[#B22234]"></div>}
    </Link>
  );
};

export default App;
