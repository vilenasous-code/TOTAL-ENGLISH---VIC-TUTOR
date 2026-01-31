
import React, { useState, useEffect } from 'react';
import { UserProfile, UserLevel } from '../types';
import { COLORS } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isGoogleEnvironment, setIsGoogleEnvironment] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ageGroup: '26-35',
    interests: [] as string[]
  });

  useEffect(() => {
    // Detecta se estamos no ambiente especial do Google AI Studio
    if (window.aistudio) {
      setIsGoogleEnvironment(true);
      const checkKey = async () => {
        if (window.aistudio?.hasSelectedApiKey) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        }
      };
      checkKey();
    } else {
      // Se estiver na web normal, verifica o localStorage
      const savedKey = localStorage.getItem('VIC_API_KEY');
      if (savedKey) {
        setHasKey(true);
        setManualKey(savedKey);
      }
    }
  }, []);

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

  const handleConnectKey = async () => {
    if (isGoogleEnvironment && window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    } else if (manualKey.trim().length > 20) {
      localStorage.setItem('VIC_API_KEY', manualKey.trim());
      setHasKey(true);
    } else {
      alert("Por favor, insira uma chave API válida.");
    }
  };

  const handleFinish = () => {
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
              <h1 className="text-3xl font-black mb-2" style={{ color: COLORS.navy }}>Bem-vindo!</h1>
              <p className="text-slate-500 text-sm">Vamos configurar seu perfil para a melhor experiência. 👋</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-300 font-medium"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-mail</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-300 font-medium"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <button 
              disabled={!formData.name || !formData.email}
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-30"
              style={{ backgroundColor: COLORS.navy }}
            >
              Próximo Passo
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h1 className="text-3xl font-black mb-2" style={{ color: COLORS.navy }}>Interesses</h1>
              <p className="text-slate-500 text-sm">Selecione tópicos que você gostaria de conversar com a Vic. 🚀</p>
            </div>

            <div className="space-y-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{cat.title}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {cat.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleToggleInterest(opt.id)}
                        className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                          formData.interests.includes(opt.id) 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                            : 'border-slate-100 bg-slate-50 text-slate-500'
                        }`}
                      >
                        <i className={`fas ${opt.icon} w-6`}></i>
                        <span className="text-xs font-black uppercase">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button 
              disabled={formData.interests.length === 0}
              onClick={() => setStep(3)}
              className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-30"
              style={{ backgroundColor: COLORS.navy }}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h1 className="text-3xl font-black mb-2" style={{ color: COLORS.navy }}>Conectividade</h1>
              <p className="text-slate-500 text-sm">A Vic precisa de uma chave API para pensar e falar. ⚡️</p>
            </div>

            <div className="space-y-4">
              <div className={`p-6 rounded-[2rem] border transition-all flex flex-col gap-4 ${hasKey ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${hasKey ? 'bg-green-500 text-white' : 'bg-white text-slate-300'}`}>
                    <i className={`fas ${hasKey ? 'fa-check' : 'fa-key'}`}></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Conexão Gemini</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black">{hasKey ? 'Conectado' : 'Ação Necessária'}</p>
                  </div>
                </div>

                {!isGoogleEnvironment && !hasKey && (
                  <div className="space-y-2 mt-2">
                    <input 
                      type="password"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder="Cole sua Gemini API Key aqui"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500"
                    />
                    <p className="text-[9px] text-slate-400">Sua chave é salva localmente e nunca sai do seu navegador.</p>
                  </div>
                )}

                <button 
                  onClick={handleConnectKey} 
                  className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${hasKey ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200'}`}
                >
                  {hasKey ? 'Chave Ativa' : 'Validar e Conectar'}
                </button>
              </div>
              
              <div className="text-center">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] font-black text-slate-400 uppercase underline">
                  Não tem uma chave? Gere uma grátis aqui
                </a>
              </div>
            </div>

            <button 
              disabled={!hasKey}
              onClick={handleFinish}
              className="w-full py-5 rounded-3xl text-white font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-30"
              style={{ backgroundColor: COLORS.red }}
            >
              Começar Treinamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
