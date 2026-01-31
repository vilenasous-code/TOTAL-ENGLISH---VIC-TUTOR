
import React, { useState, useRef } from 'react';
import { 
  getSearchGroundedResponse, 
  analyzeImage, 
  analyzeVideo, 
  getProVicResponse 
} from '../services/gemini';
import { COLORS } from '../constants';

const Laboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'image' | 'video' | 'chat'>('search');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await getSearchGroundedResponse(query);
      if (res && res.text) {
        setResult(res.text);
        setSources(res.sources || []);
      } else {
        setResult("No results found or search failed.");
        setSources([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResult("An error occurred during search. Please check your connection.");
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setFilePreview(reader.result as string);
      
      setLoading(true);
      try {
        let resText = "";
        if (activeTab === 'image') {
          resText = await analyzeImage(base64, file.type, query || "What is happening in this image? Explain in English for a student.");
        } else if (activeTab === 'video') {
          resText = await analyzeVideo(base64, file.type, query || "Summarize the key events in this video in English.");
        }
        setResult(resText || "Analysis returned no text.");
      } catch (err) {
        console.error("Analysis error:", err);
        setResult("Error analyzing file. Please try a smaller file or different format.");
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeepChat = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Fixed: Added missing interests parameter (empty array) to satisfy getProVicResponse signature
      const res = await getProVicResponse(query, "Advanced", "Student", []);
      setResult(res || "Thinking model provided no response.");
    } catch (error) {
      console.error("Deep chat error:", error);
      setResult("Deep reasoning failed. Ensure you have a valid paid API key selected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.navy }}>Vic Insight Lab</h2>
          <p className="text-slate-500 text-sm font-medium">Multimodal AI Research & Deep Learning</p>
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
           <i className="fa-solid fa-microscope text-xl"></i>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-1.5 rounded-3xl border border-slate-100 shadow-sm gap-1 overflow-x-auto scrollbar-hide">
        {[
          { id: 'search', icon: 'fa-search', label: 'Grounding' },
          { id: 'image', icon: 'fa-image', label: 'Vision' },
          { id: 'video', icon: 'fa-clapperboard', label: 'Motion' },
          { id: 'chat', icon: 'fa-brain', label: 'Thinking' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setResult(null); setFilePreview(null); setSources([]); }}
            className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            style={activeTab === tab.id ? { backgroundColor: COLORS.navy } : {}}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {activeTab === 'chat' ? 'Complexity Prompt' : 'Research Context'}
          </label>
          <div className="flex gap-2">
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              placeholder={activeTab === 'chat' ? "Ask a complex grammar question..." : "Enter keywords or instructions..."}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none text-sm font-medium focus:border-blue-300 transition-all"
            />
          </div>
        </div>

        {(activeTab === 'image' || activeTab === 'video') && (
          <div className="space-y-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-[#B22234] hover:border-[#B22234] transition-all bg-slate-50/50"
            >
              {filePreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                   {activeTab === 'image' ? (
                     <img src={filePreview} alt="Preview" className="h-full object-contain rounded-xl" />
                   ) : (
                     <video src={filePreview} className="h-full rounded-xl" />
                   )}
                   <span className="absolute bottom-2 right-2 bg-white text-[9px] font-black px-2 py-1 rounded-full shadow-sm text-slate-500 uppercase">Change File</span>
                </div>
              ) : (
                <>
                  <i className={`fas ${activeTab === 'image' ? 'fa-camera-retro' : 'fa-film'} text-3xl mb-2 opacity-30`}></i>
                  <span className="text-xs font-bold">Tap to upload {activeTab}</span>
                </>
              )}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden accept={activeTab === 'image' ? "image/*" : "video/*"} />
          </div>
        )}

        <button 
          onClick={activeTab === 'search' ? handleSearch : activeTab === 'chat' ? handleDeepChat : () => {}}
          disabled={loading || (activeTab !== 'search' && activeTab !== 'chat')}
          className="w-full text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all disabled:opacity-20"
          style={{ backgroundColor: COLORS.red }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
               <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <span>Vic is analyzing...</span>
            </div>
          ) : (
            `Execute ${activeTab} Analysis`
          )}
        </button>

        {result && (
          <div className="p-6 rounded-3xl text-white animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl border-l-4 border-[#B22234]" style={{ backgroundColor: '#0F172A' }}>
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 bg-[#B22234] rounded-full flex items-center justify-center text-[10px] font-black italic">V</div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Vic Insight</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{result}</p>
            
            {activeTab === 'search' && sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Grounding Sources</p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-blue-400 font-bold hover:bg-white/10 transition-colors truncate max-w-[140px]">
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lab Tips */}
      <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex gap-4">
         <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0">
            <i className="fas fa-lightbulb"></i>
         </div>
         <div>
            <h4 className="font-bold text-amber-900 text-sm">Lab Pro Tip</h4>
            <p className="text-xs text-amber-800/70 leading-relaxed mt-1">
              Use the **Thinking** tab for grammar rules that don't make sense. Vic will use her deep neural network to break it down for you!
            </p>
         </div>
      </div>
    </div>
  );
};

export default Laboratory;
