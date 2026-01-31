
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
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let stream: MediaStream | null = null;

    const initAudio = async () => {
      if (isRecording) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
          });
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          
          analyserRef.current = analyser;
          dataArrayRef.current = dataArray;

          const animate = () => {
            const currentAnalyser = analyserRef.current;
            const currentDataArray = dataArrayRef.current;
            if (currentAnalyser && currentDataArray) {
              currentAnalyser.getByteFrequencyData(currentDataArray);
              const slice = Array.from(currentDataArray.slice(0, 10));
              const sum = slice.reduce((a: number, b: number) => a + b, 0);
              const avg = (sum as number) / 10;
              const normalized = Math.max(2, (avg / 255) * 40);
              setAmplitudes(prev => [...prev.slice(1), normalized]);
            }
            requestRef.current = requestAnimationFrame(animate);
          };
          animate();
        } catch (err) {
          console.error("Waveform init error:", err);
        }
      }
    };
    initAudio();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (source) source.disconnect();
      if (audioCtx) audioCtx.close();
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isRecording]);

  // Visual pulse when playing
  useEffect(() => {
    if (isPlaying && !isRecording) {
      const interval = setInterval(() => {
        setAmplitudes(prev => [...prev.slice(1), Math.random() * 20 + 5]);
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
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isThinking, setIsThinking] = useState(false); 
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [showKeyWarning, setShowKeyWarning] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const lastTranscriptRef = useRef<string>('');
  const manualStopRef = useRef<boolean>(false);
  const ttsSentenceBuffer = useRef<string>('');
  const processedSentences = useRef<Set<string>>(new Set());

  const getRandomGreeting = (userName: string, category?: string) => {
    const greetings = [
      `Hey ${userName}! Ready to crush it today? 🚀`,
      `Hi Champion! Let's work on your goals. ✨`,
      `Partner, I'm ready for our chat! 🎧`,
      `Ready to shine, Rockstar ${userName}? 🚀`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  useEffect(() => {
    const initMic = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) { console.error("Mic access denied"); }
    };
    initMic();
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; 
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => { setIsRecording(true); setIsProcessing(false); setInterimText(''); lastTranscriptRef.current = ''; manualStopRef.current = false; };
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) transcript += event.results[i][0].transcript;
        setInterimText(transcript);
        lastTranscriptRef.current = transcript;
      };
      recognition.onend = () => {
        setIsRecording(false);
        if (manualStopRef.current) {
          const finalSpeech = lastTranscriptRef.current.trim();
          if (finalSpeech) handleSendMessage(finalSpeech);
        }
        setInterimText('');
      };
      recognitionRef.current = recognition;
    }

    if (messages.length === 0) {
      const greeting = getRandomGreeting(profile.name, scenario?.category);
      setMessages([{ role: 'vic', text: greeting }]);
      playVicVoice(greeting);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking, interimText, streamingText]);

  const playVicVoice = async (text: string) => {
    if (!text.trim() || !audioContextRef.current) return;
    setIsPlayingAudio(true);
    try {
      const audioBase64 = await speakWithVic(text);
      if (audioBase64) {
        const ctx = audioContextRef.current;
        const audioData = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
        source.start(startTime);
        nextStartTimeRef.current = startTime + audioBuffer.duration;
        
        source.onended = () => {
          if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
            setIsPlayingAudio(false);
          }
        };
      }
    } catch (e) { 
      console.error("Audio playback error", e);
      setIsPlayingAudio(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setIsThinking(true);
    setStreamingText('');
    ttsSentenceBuffer.current = '';
    processedSentences.current.clear();

    try {
      const history = messages.slice(-4).map(m => ({ 
        role: m.role === 'vic' ? 'model' : 'user', 
        parts: [{ text: m.text }] 
      }));

      const stream = getVicStreamingResponse(text, profile.level, profile.name, profile.interests, history);
      let fullJsonString = '';
      
      for await (const chunk of stream) {
        fullJsonString += chunk;
        
        // Use regex to extract response_text from partial JSON stream
        const textMatch = fullJsonString.match(/"response_text":\s*"([^"]*)/);
        if (textMatch && textMatch[1]) {
          const currentFullText = textMatch[1];
          setStreamingText(currentFullText);

          // Sentence detection for low-latency TTS
          const sentences = currentFullText.split(/(?<=[.!?])\s+/);
          for (let i = 0; i < sentences.length - 1; i++) {
            const s = sentences[i].trim();
            if (s && !processedSentences.current.has(s)) {
              processedSentences.current.add(s);
              playVicVoice(s); // Play as soon as a sentence is complete
            }
          }
        }
      }

      try {
        const finalData = JSON.parse(fullJsonString);
        setIsThinking(false);
        setStreamingText('');
        setMessages(prev => [...prev, { 
          role: 'vic', 
          text: finalData.response_text,
          correction: finalData.correction_hint || undefined 
        }]);

        // Play remaining last sentence if not already processed
        const lastSentence = finalData.response_text.split(/(?<=[.!?])\s+/).pop()?.trim();
        if (lastSentence && !processedSentences.current.has(lastSentence)) {
          playVicVoice(lastSentence);
        }
        
        onFinishConversation(1);
      } catch (e) {
        setIsThinking(false);
        setStreamingText('');
        const fallback = "Got it! Let's keep going. 🚀";
        setMessages(prev => [...prev, { role: 'vic', text: fallback }]);
        playVicVoice(fallback);
      }
    } catch (error: any) {
      setIsThinking(false);
      setStreamingText('');
      if (error?.message?.includes("Requested entity was not found")) setShowKeyWarning(true);
    }
  };

  const toggleRecording = () => {
    if ('vibrate' in navigator) navigator.vibrate(25);
    if (isRecording) {
      manualStopRef.current = true;
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-lg mx-auto relative overflow-hidden">
      {showKeyWarning && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-2xl absolute top-0 left-0 right-0 z-20 shadow-lg mx-2">
          <p className="text-xs text-red-700 font-bold">API Key Error. <button onClick={() => window.aistudio?.openSelectKey()} className="underline font-black">Select Key</button></p>
        </div>
      )}

      {/* Mini Header */}
      <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-3xl mb-3 mx-2 mt-1 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: COLORS.navy }}>
            <i className="fas fa-bolt text-xs"></i>
          </div>
          <div>
            <h3 className="font-black text-[10px] uppercase tracking-tighter" style={{ color: COLORS.navy }}>Vic High-Speed</h3>
            <div className="flex items-center gap-1">
              <span className={`w-1 h-1 rounded-full ${isThinking || isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-[8px] text-slate-400 font-black uppercase">Low Latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-3 pb-28 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-medium ${
              msg.role === 'user' ? 'text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border-l-2 border-[#B22234]'
            }`} style={msg.role === 'user' ? { backgroundColor: COLORS.navy } : {}}>
              {msg.text}
            </div>
            {msg.correction && (
              <div className="max-w-[80%] bg-blue-50/50 p-2 rounded-xl text-[9px] text-blue-700 font-bold mt-1 flex items-center gap-1">
                <i className="fas fa-magic text-blue-400"></i> {msg.correction}
              </div>
            )}
          </div>
        ))}

        {streamingText && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border-l-2 border-amber-400 text-slate-800 text-sm shadow-sm">
                {streamingText}
                <span className="inline-block w-1 h-4 bg-amber-400 ml-1 animate-pulse"></span>
             </div>
          </div>
        )}

        {interimText && (
          <div className="flex justify-end opacity-40">
            <div className="bg-slate-100 p-3 rounded-2xl text-[10px] font-bold text-slate-500 italic">
              {interimText}...
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <div className="flex-1 bg-white rounded-3xl min-h-[56px] shadow-lg border border-slate-200 overflow-hidden flex items-center">
            {isRecording ? (
              <div className="flex-1 flex items-center justify-between px-4">
                <span className="text-[10px] font-black text-red-600 uppercase animate-pulse">Live</span>
                <div className="flex-1 mx-2"><Waveform isRecording={isRecording} /></div>
                <button onClick={() => recognitionRef.current?.stop()} className="text-[9px] font-black text-slate-400 uppercase">Stop</button>
              </div>
            ) : (
              <div className="flex-1 flex items-center">
                <input 
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)} 
                  placeholder={`Say something...`} 
                  className="flex-1 px-5 py-3.5 outline-none text-sm font-medium" 
                  disabled={isThinking} 
                />
                <div className="pr-4"><Waveform isRecording={false} isPlaying={isPlayingAudio} /></div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
             <button 
               onClick={inputText.trim() ? () => handleSendMessage(inputText) : toggleRecording} 
               disabled={isThinking} 
               className={`w-[56px] h-[56px] rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all active:scale-90 ${
                 isRecording ? 'bg-[#B22234]' : ''
               }`}
               style={!isRecording ? { backgroundColor: COLORS.navy } : {}}
             >
               <i className={`fas ${inputText.trim() ? 'fa-paper-plane' : isRecording ? 'fa-square' : 'fa-microphone'}`}></i>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
