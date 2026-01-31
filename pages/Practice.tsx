
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Message, UserProfile } from '../types';
import { 
  getVicStreamingResponse, 
  speakWithVic, 
  decodeBase64, 
  decodeAudioData 
} from '../services/gemini';
import { COLORS } from '../constants';

const Waveform: React.FC<{ isRecording: boolean; isPlaying?: boolean }> = ({ isRecording, isPlaying }) => {
  const [amplitudes, setAmplitudes] = useState<number[]>(new Array(30).fill(2));
  const requestRef = useRef<number>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let stream: MediaStream | null = null;

    const initAudio = async () => {
      if (isRecording) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const animate = () => {
            analyser.getByteFrequencyData(dataArray);
            const slice = Array.from(dataArray.slice(0, 10));
            const sum = slice.reduce((a: number, b: number) => a + b, 0);
            const avg = (sum as number) / 10;
            const normalized = Math.max(2, (avg / 255) * 40);
            setAmplitudes(prev => [...prev.slice(1), normalized]);
            requestRef.current = requestAnimationFrame(animate);
          };
          animate();
        } catch (err) { console.error(err); }
      }
    };
    initAudio();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioCtx) audioCtx.close();
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isRecording]);

  useEffect(() => {
    if (isPlaying && !isRecording) {
      const interval = setInterval(() => {
        setAmplitudes(prev => [...prev.slice(1), Math.random() * 25 + 5]);
      }, 50);
      return () => clearInterval(interval);
    } else if (!isRecording) {
      setAmplitudes(new Array(30).fill(2));
    }
  }, [isPlaying, isRecording]);

  return (
    <div className="flex items-center justify-end gap-[3px] h-10 w-full px-2 overflow-hidden">
      {amplitudes.map((amp, i) => (
        <div key={i} className="w-[3px] rounded-full transition-all duration-75" style={{ height: `${amp}px`, backgroundColor: isRecording ? COLORS.red : COLORS.navy, opacity: 0.2 + (amp / 50) }} />
      ))}
    </div>
  );
};

const Practice: React.FC<{ profile: UserProfile; onFinishConversation: (stars: number) => void }> = ({ profile, onFinishConversation }) => {
  const location = useLocation();
  const scenario = location.state?.scenario;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const manualStopRef = useRef<boolean>(false);
  const processedSentences = useRef<Set<string>>(new Set());

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; 
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => { setIsRecording(true); setInterimText(''); manualStopRef.current = false; };
      recognition.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) transcript += e.results[i][0].transcript;
        setInterimText(transcript);
      };
      recognition.onend = () => {
        setIsRecording(false);
        if (manualStopRef.current) {
          const final = interimText.trim();
          if (final) handleSendMessage(final);
        }
        setInterimText('');
      };
      recognitionRef.current = recognition;
    }

    if (messages.length === 0) {
      const welcome = `Hey ${profile.name.split(' ')[0]}! Ready for ${scenario?.title || 'some English'}? 🚀`;
      setMessages([{ role: 'vic', text: welcome }]);
      playVicVoice(welcome);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, interimText, streamingText]);

  const playVicVoice = async (text: string) => {
    if (!text.trim() || !audioContextRef.current) return;
    setIsPlayingAudio(true);
    try {
      const base64 = await speakWithVic(text);
      if (base64) {
        const ctx = audioContextRef.current;
        const buffer = await decodeAudioData(decodeBase64(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        const start = Math.max(nextStartTimeRef.current, ctx.currentTime);
        source.start(start);
        nextStartTimeRef.current = start + buffer.duration;
        source.onended = () => { if (ctx.currentTime >= nextStartTimeRef.current - 0.1) setIsPlayingAudio(false); };
      }
    } catch (e) { console.error(e); setIsPlayingAudio(false); }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setStreamingText('');
    processedSentences.current.clear();

    try {
      const history = messages.slice(-4).map(m => ({ 
        role: m.role === 'vic' ? 'model' : 'user', 
        parts: [{ text: m.text }] 
      }));

      const stream = getVicStreamingResponse(text, profile.level, profile.name, profile.interests, history);
      let fullJson = '';
      
      for await (const chunk of stream) {
        fullJson += chunk;
        const match = fullJson.match(/"response_text":\s*"([^"]*)/);
        if (match && match[1]) {
          const extracted = match[1];
          setStreamingText(extracted);
          const sentences = extracted.split(/(?<=[.!?])\s+/);
          for (let i = 0; i < sentences.length - 1; i++) {
            const s = sentences[i].trim();
            if (s && !processedSentences.current.has(s)) {
              processedSentences.current.add(s);
              playVicVoice(s);
            }
          }
        }
      }

      const final = JSON.parse(fullJson);
      setStreamingText('');
      setMessages(prev => [...prev, { role: 'vic', text: final.response_text, correction: final.correction_hint || undefined }]);
      
      const lastS = final.response_text.split(/(?<=[.!?])\s+/).pop()?.trim();
      if (lastS && !processedSentences.current.has(lastS)) playVicVoice(lastS);
      
      onFinishConversation(1);
    } catch (e) {
      setStreamingText('');
      setMessages(prev => [...prev, { role: 'vic', text: "Let's keep practicing! 🚀" }]);
    }
  };

  const toggleRecording = () => {
    if ('vibrate' in navigator) navigator.vibrate(25);
    if (isRecording) { manualStopRef.current = true; recognitionRef.current?.stop(); }
    else { recognitionRef.current?.start(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-lg mx-auto relative">
      <div className="p-3 bg-white border border-slate-100 rounded-3xl mb-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-blue-600">
            <i className="fas fa-bolt text-xs"></i>
          </div>
          <div>
            <h3 className="font-black text-[10px] uppercase tracking-tighter text-blue-900">Vic Stream</h3>
            <span className="text-[8px] text-green-500 font-black uppercase">Low Latency</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-3 pb-28 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border-l-2 border-red-600'}`}>
              {msg.text}
            </div>
            {msg.correction && (
              <div className="bg-blue-50/50 p-2 rounded-xl text-[9px] text-blue-700 font-bold mt-1 flex items-center gap-1">
                <i className="fas fa-magic"></i> {msg.correction}
              </div>
            )}
          </div>
        ))}
        {streamingText && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border-l-2 border-amber-400 text-slate-800 text-sm">
                {streamingText}<span className="inline-block w-1 h-4 bg-amber-400 ml-1 animate-pulse"></span>
             </div>
          </div>
        )}
        {interimText && <div className="flex justify-end opacity-40"><div className="bg-slate-100 p-3 rounded-2xl text-[10px] font-bold italic">{interimText}...</div></div>}
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <div className="flex-1 bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex items-center h-[56px]">
            {isRecording ? (
              <div className="flex-1 flex items-center px-4">
                <span className="text-[10px] font-black text-red-600 uppercase animate-pulse">Live</span>
                <div className="flex-1 mx-2"><Waveform isRecording={isRecording} /></div>
              </div>
            ) : (
              <div className="flex-1 flex items-center">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)} placeholder="Reply to Vic..." className="flex-1 px-5 outline-none text-sm font-medium" />
                <div className="pr-4"><Waveform isRecording={false} isPlaying={isPlayingAudio} /></div>
              </div>
            )}
          </div>
          <button onClick={inputText.trim() ? () => handleSendMessage(inputText) : toggleRecording} className={`w-[56px] h-[56px] rounded-full flex items-center justify-center text-white text-xl shadow-lg active:scale-90 ${isRecording ? 'bg-red-600' : 'bg-blue-600'}`}>
            <i className={`fas ${inputText.trim() ? 'fa-paper-plane' : isRecording ? 'fa-square' : 'fa-microphone'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Practice;
