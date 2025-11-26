import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
// FIX: Rename the imported Blob type to avoid collision with the native browser Blob.
import type { LiveServerMessage, Blob as GeminiBlob, GroundingChunk } from '@google/genai';
import type { User, ChatMessage } from '../types';
import * as gemini from '../services/geminiService';
import ClauseInvestigator from './ClauseInvestigator';
import {
    ChevronDownIcon, BotMessageSquareIcon, ImageIcon, VideoIcon, MicIcon, SearchIcon,
    BrainCircuitIcon, SparklesIcon, MapIcon, Volume2Icon, UploadCloudIcon
} from './icons';

interface AIToolsProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const AITool: React.FC<{ title: string, description: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, description, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-6 text-left flex items-center space-x-4">
                <div className="text-teal-400">{icon}</div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="text-sm text-slate-400">{description}</p>
                </div>
                <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                    {children}
                </div>
            )}
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const FileInput: React.FC<{ onFileSelect: (file: File) => void, accept: string, label: string }> = ({ onFileSelect, accept, label }) => {
    const [fileName, setFileName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };
    return (
        <div className="flex-1">
            <button onClick={() => inputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700/50 hover:border-teal-500 transition-colors">
                <UploadCloudIcon className="h-8 w-8 text-slate-400 mb-2"/>
                <span className="text-sm font-semibold text-slate-300">{label}</span>
                {fileName && <span className="text-xs text-teal-400 mt-1">{fileName}</span>}
            </button>
            <input type="file" ref={inputRef} onChange={handleFileChange} accept={accept} className="hidden" />
        </div>
    );
}

// Function to convert Float32 audio data to Int16 PCM for Gemini
function createPcmBlob(data: Float32Array): GeminiBlob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp values to [-1, 1] range to prevent overflow artifacts
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
        data: gemini.encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

const AITools: React.FC<AIToolsProps> = ({ user, onUserUpdate }) => {

    // --- TTS State & Logic ---
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return () => audioContextRef.current?.close();
    }, []);

    const handleTextToSpeech = async (text: string) => {
        if (!text || isSpeaking) return;
        setIsSpeaking(true);
        try {
            const base64Audio = await gemini.textToSpeech(text);
            if (base64Audio && audioContextRef.current) {
                const audioBuffer = await gemini.decodeAudioData(gemini.decode(base64Audio), audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
                source.onended = () => setIsSpeaking(false);
            } else {
                setIsSpeaking(false);
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        }
    };

    const SpeakButton: React.FC<{ text: string }> = ({ text }) => (
        <button onClick={() => handleTextToSpeech(text)} disabled={isSpeaking || !text} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Volume2Icon className="h-4 w-4"/>
        </button>
    );

    // --- CHATBOT ---
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gemini.startChat();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput || isChatLoading) return;
        
        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
        setChatHistory(prev => [...prev, newUserMessage]);
        setIsChatLoading(true);
        setChatInput('');

        try {
            const response = await gemini.sendMessage(chatInput);
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I couldn't get a response. Please try again." }] };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // --- Image Studio ---
    const [imgPrompt, setImgPrompt] = useState('');
    const [imgAspectRatio, setImgAspectRatio] = useState('1:1');
    const [imgResult, setImgResult] = useState('');
    const [isImgLoading, setIsImgLoading] = useState(false);
    const [imgError, setImgError] = useState('');
    
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [editResult, setEditResult] = useState('');
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const [analyzeImgFile, setAnalyzeImgFile] = useState<File | null>(null);
    const [analyzeImgPrompt, setAnalyzeImgPrompt] = useState('');
    const [analyzeImgResult, setAnalyzeImgResult] = useState('');
    const [isAnalyzeImgLoading, setIsAnalyzeImgLoading] = useState(false);
    const [analyzeImgError, setAnalyzeImgError] = useState('');

    const handleGenerateImage = async () => {
        if (!imgPrompt) return;
        setIsImgLoading(true); setImgError(''); setImgResult('');
        try {
            const base64 = await gemini.generateImage(imgPrompt, imgAspectRatio);
            setImgResult(`data:image/jpeg;base64,${base64}`);
        } catch (e) { setImgError(e instanceof Error ? e.message : "Failed to generate image."); } 
        finally { setIsImgLoading(false); }
    };

    const handleEditImage = async () => {
        if (!editFile || !editPrompt) return;
        setIsEditLoading(true); setEditError(''); setEditResult('');
        try {
            const part = await gemini.fileToGenerativePart(editFile);
            const base64 = await gemini.editImage(part, editPrompt);
            setEditResult(`data:image/png;base64,${base64}`);
        } catch (e) { setEditError(e instanceof Error ? e.message : "Failed to edit image."); } 
        finally { setIsEditLoading(false); }
    };

    const handleAnalyzeImage = async () => {
        if (!analyzeImgFile || !analyzeImgPrompt) return;
        setIsAnalyzeImgLoading(true); setAnalyzeImgError(''); setAnalyzeImgResult('');
        try {
            const part = await gemini.fileToGenerativePart(analyzeImgFile);
            const result = await gemini.analyzeMedia(part, analyzeImgPrompt, 'gemini-2.5-flash');
            setAnalyzeImgResult(result);
        } catch (e) { setAnalyzeImgError(e instanceof Error ? e.message : "Failed to analyze image."); } 
        finally { setIsAnalyzeImgLoading(false); }
    };

    // --- Video Studio ---
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [videoResult, setVideoResult] = useState('');
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState('');
    const [isVideoKeyReady, setIsVideoKeyReady] = useState(false);

    const checkVideoKey = useCallback(async () => {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsVideoKeyReady(hasKey);
        return hasKey;
    }, []);

    useEffect(() => {
        checkVideoKey();
    }, [checkVideoKey]);

    const handleSelectVideoKey = async () => {
        await (window as any).aistudio.openSelectKey();
        await checkVideoKey();
    };

    const handleGenerateVideo = async () => {
        if (!videoPrompt) return;
        if (!(await checkVideoKey())) return;
        setIsVideoLoading(true); setVideoError(''); setVideoResult('');
        try {
            const resultUrl = await gemini.generateVideo(videoPrompt, videoAspectRatio);
            setVideoResult(resultUrl);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Failed to generate video.";
            if (errorMessage.includes("Requested entity was not found")) {
                setVideoError("API Key error. Please re-select your key.");
                setIsVideoKeyReady(false);
            } else {
                setVideoError(errorMessage);
            }
        } finally {
            setIsVideoLoading(false);
        }
    };
    
    const [analyzeVideoFile, setAnalyzeVideoFile] = useState<File | null>(null);
    const [analyzeVideoPrompt, setAnalyzeVideoPrompt] = useState('');
    const [analyzeVideoResult, setAnalyzeVideoResult] = useState('');
    const [isAnalyzeVideoLoading, setIsAnalyzeVideoLoading] = useState(false);
    const [analyzeVideoError, setAnalyzeVideoError] = useState('');

    const handleAnalyzeVideo = async () => {
        if (!analyzeVideoFile || !analyzeVideoPrompt) return;
        setIsAnalyzeVideoLoading(true); setAnalyzeVideoError(''); setAnalyzeVideoResult('');
        try {
            const part = await gemini.fileToGenerativePart(analyzeVideoFile);
            // Use gemini-3-pro-image-preview for high quality video/image analysis (multimodal)
            const result = await gemini.analyzeMedia(part, analyzeVideoPrompt, 'gemini-3-pro-image-preview');
            setAnalyzeVideoResult(result);
        } catch (e) { setAnalyzeVideoError(e instanceof Error ? e.message : "Failed to analyze video."); } 
        finally { setIsAnalyzeVideoLoading(false); }
    };

    // --- Audio Tools ---
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionError, setTranscriptionError] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<any[]>([]);

    const handleToggleRecording = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (event) => {
                        audioChunksRef.current.push(event.data);
                    };
                    mediaRecorderRef.current.onstop = async () => {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        audioChunksRef.current = [];
                        setIsTranscribing(true); setTranscriptionError(''); setTranscription('');
                        try {
                            const part = await gemini.fileToGenerativePart(new File([audioBlob], "audio.webm", {type: 'audio/webm'}));
                            const result = await gemini.transcribeAudio(part);
                            setTranscription(result);
                        } catch (e) { setTranscriptionError(e instanceof Error ? e.message : "Failed to transcribe audio.")}
                        finally { setIsTranscribing(false); stream.getTracks().forEach(track => track.stop());}
                    };
                    mediaRecorderRef.current.start();
                    setIsRecording(true);
                })
                .catch(err => setTranscriptionError("Microphone access denied."));
        }
    };

    const [liveStatus, setLiveStatus] = useState<'disconnected'|'connecting'|'connected'|'error'>('disconnected');
    const [liveTranscription, setLiveTranscription] = useState<{user:string, model:string}[]>([]);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const startLiveConversation = async () => {
        if (liveStatus !== 'disconnected' && liveStatus !== 'error') return;
        setLiveStatus('connecting');
        setLiveTranscription([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setLiveStatus('connected');
                        if (!inputAudioContextRef.current || !streamRef.current) return;
                        const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            // Critical: Solely rely on sessionPromise resolves to send input.
                            sessionPromiseRef.current?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        } else if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscriptionRef.current;
                            const fullOutput = currentOutputTranscriptionRef.current;
                            setLiveTranscription(prev => [...prev, {user: fullInput, model: fullOutput}]);
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await gemini.decodeAudioData(gemini.decode(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            for (const source of sourcesRef.current.values()) source.stop();
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: () => setLiveStatus('error'),
                    onclose: () => stopLiveConversation(true),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
            });
        } catch (e) {
            console.error("Live connection error:", e);
            setLiveStatus('error');
        }
    };
    
    const stopLiveConversation = (fromCallback = false) => {
        if (!fromCallback) {
          sessionPromiseRef.current?.then(session => session.close());
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        sessionPromiseRef.current = null;
        setLiveStatus('disconnected');
    };

    // --- Research Assistant ---
    const [groundedQuery, setGroundedQuery] = useState('');
    const [useMaps, setUseMaps] = useState(false);
    const [groundedResult, setGroundedResult] = useState<{text: string, chunks: GroundingChunk[]}>({text: '', chunks: []});
    const [isGroundedLoading, setIsGroundedLoading] = useState(false);
    const [groundedError, setGroundedError] = useState('');

    const handleGroundedSearch = async () => {
        if (!groundedQuery) return;
        setIsGroundedLoading(true); setGroundedError(''); setGroundedResult({text: '', chunks: []});
        try {
            let location: {latitude: number, longitude: number} | undefined = undefined;
            if (useMaps) {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
                    location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                } catch (e) { console.warn("Could not get location."); }
            }
            const result = await gemini.groundedSearch(groundedQuery, useMaps, location);
            setGroundedResult(result);
        } catch(e) { setGroundedError(e instanceof Error ? e.message : 'Search failed.'); }
        finally { setIsGroundedLoading(false); }
    };
    
    const [complexQuery, setComplexQuery] = useState('');
    const [complexResult, setComplexResult] = useState('');
    const [isComplexLoading, setIsComplexLoading] = useState(false);
    const [complexError, setComplexError] = useState('');

    const handleComplexQuery = async () => {
        if (!complexQuery) return;
        setIsComplexLoading(true); setComplexError(''); setComplexResult('');
        try {
            const result = await gemini.complexQuery(complexQuery);
            setComplexResult(result);
        } catch (e) { setComplexError(e instanceof Error ? e.message : 'Query failed.'); }
        finally { setIsComplexLoading(false); }
    };
    
    // --- Bio Generator ---
    const [bioKeywords, setBioKeywords] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');

    const handleGenerateBio = async () => {
      setIsGenerating(true); setAiError('');
      try {
        const newBio = await gemini.generateBio(bioKeywords, user.role);
        onUserUpdate({ ...user, community_profile: { ...user.community_profile, bio: newBio } });
      } catch (error) { setAiError(error instanceof Error ? error.message : "An unknown error occurred.");} 
      finally { setIsGenerating(false); }
    };

    return (
        <div className="space-y-6">
            <AITool title="AI Chat" description="Have a conversation with your AI assistant." icon={<BotMessageSquareIcon className="h-8 w-8"/>}>
                <div className="h-96 flex flex-col">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-slate-900/50 rounded-t-lg space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-teal-800 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                    {msg.parts[0].text}
                                    {msg.role === 'model' && <SpeakButton text={msg.parts[0].text} />}
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-md p-3 rounded-xl bg-slate-700 text-slate-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleChatSubmit} className="flex p-2 border-t border-slate-700 bg-slate-900/50 rounded-b-lg">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-transparent focus:outline-none text-white px-2" />
                        <button type="submit" disabled={isChatLoading || !chatInput} className="bg-teal-600 font-semibold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed">Send</button>
                    </form>
                </div>
            </AITool>
            
            <AITool title="Media Studio" description="Generate and edit images and video." icon={<ImageIcon className="h-8 w-8"/>}>
                <div className="space-y-6">
                    {/* Image Gen */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Generate Image (Imagen 4)</h4>
                      <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 space-y-2">
                            <textarea value={imgPrompt} onChange={e => setImgPrompt(e.target.value)} placeholder="A robot holding a red skateboard." className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none"/>
                            <select value={imgAspectRatio} onChange={e => setImgAspectRatio(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none">
                                {["1:1", "16:9", "9:16", "4:3", "3:4"].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button onClick={handleGenerateImage} disabled={isImgLoading || !imgPrompt} className="w-full bg-teal-600 font-semibold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 flex justify-center">{isImgLoading ? <LoadingSpinner/> : "Generate"}</button>
                            {imgError && <p className="text-red-400 text-sm">{imgError}</p>}
                          </div>
                          <div className="flex-1 h-64 bg-slate-900 rounded-md flex items-center justify-center">{imgResult ? <img src={imgResult} className="max-h-full max-w-full rounded-md"/> : <ImageIcon className="h-16 w-16 text-slate-600"/>}</div>
                      </div>
                    </div>
                     {/* Image Edit */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Edit Image</h4>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <FileInput onFileSelect={setEditFile} accept="image/*" label="Upload Image to Edit" />
                                <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="Add a retro filter" className="w-full h-20 bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none"/>
                                <button onClick={handleEditImage} disabled={isEditLoading || !editFile || !editPrompt} className="w-full bg-teal-600 font-semibold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 flex justify-center">{isEditLoading ? <LoadingSpinner/> : "Edit"}</button>
                                {editError && <p className="text-red-400 text-sm">{editError}</p>}
                            </div>
                            <div className="flex-1 h-64 bg-slate-900 rounded-md flex items-center justify-center">{editResult ? <img src={editResult} className="max-h-full max-w-full rounded-md"/> : <ImageIcon className="h-16 w-16 text-slate-600"/>}</div>
                        </div>
                    </div>
                    {/* Image Analysis */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Analyze Image</h4>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <FileInput onFileSelect={setAnalyzeImgFile} accept="image/*" label="Upload Image to Analyze" />
                                <textarea value={analyzeImgPrompt} onChange={e => setAnalyzeImgPrompt(e.target.value)} placeholder="What kind of weld is this?" className="w-full h-20 bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none"/>
                                <button onClick={handleAnalyzeImage} disabled={isAnalyzeImgLoading || !analyzeImgFile || !analyzeImgPrompt} className="w-full bg-teal-600 font-semibold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 flex justify-center">{isAnalyzeImgLoading ? <LoadingSpinner/> : "Analyze"}</button>
                            </div>
                            <div className="flex-1 h-64 bg-slate-900 rounded-md p-4 overflow-y-auto">
                                {analyzeImgError && <p className="text-red-400 text-sm">{analyzeImgError}</p>}
                                {analyzeImgResult && <div className="text-slate-300 whitespace-pre-wrap">{analyzeImgResult}<SpeakButton text={analyzeImgResult} /></div>}
                            </div>
                        </div>
                    </div>
                </div>
            </AITool>

            <AITool title="Video Studio" description="Generate and analyze video content." icon={<VideoIcon className="h-8 w-8"/>}>
                <div className="space-y-6">
                    {/* Video Gen */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Generate Video (Veo)</h4>
                        {!isVideoKeyReady ? (
                             <div className="bg-amber-900/50 border border-amber-700 p-4 rounded-lg text-center">
                                <p className="text-amber-200">Video generation requires an API key with access to Veo. Please select your key to continue.</p>
                                <p className="text-xs text-amber-300 mt-1">For more info, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">billing documentation</a>.</p>
                                <button onClick={handleSelectVideoKey} className="mt-4 bg-amber-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-500">Select API Key</button>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="A neon hologram of a cat driving at top speed" className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none"/>
                                    <select value={videoAspectRatio} onChange={e => setVideoAspectRatio(e.target.value as any)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none">
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                    </select>
                                    <button onClick={handleGenerateVideo} disabled={isVideoLoading || !videoPrompt} className="w-full bg-teal-600 font-semibold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 flex justify-center">{isVideoLoading ? <LoadingSpinner/> : "Generate"}</button>
                                    {videoError && <p className="text-red-400 text-sm">{videoError}</p>}
                                </div>
                                <div className="flex-1 h-64 bg-slate-900 rounded-md flex items-center justify-center">
                                    {isVideoLoading && <div className="text-center"><LoadingSpinner/><p className="text-sm mt-2">Generating video... (can take a few minutes)</p></div>}
                                    {videoResult && <video src={videoResult} controls className="max-h-full max-w-full rounded-md"/>}
                                    {!isVideoLoading && !videoResult && <VideoIcon className="h-16 w-16 text-slate-600"/>}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Video Analysis */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Analyze Video (Gemini 3 Pro)</h4>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <FileInput onFileSelect={setAnalyzeVideoFile} accept="video/*" label="Upload Video to Analyze" />
                                <textarea value={analyzeVideoPrompt} onChange={e => setAnalyzeVideoPrompt(e.target.value)} placeholder="What are the key moments in this clip?" className="w-full h-20 bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none"/>
                                <button onClick={handleAnalyzeVideo} disabled={isAnalyzeVideoLoading || !analyzeVideoFile || !analyzeVideoPrompt} className="w-full bg-teal-600 font-semibold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 flex justify-center">{isAnalyzeVideoLoading ? <LoadingSpinner/> : "Analyze"}</button>
                            </div>
                            <div className="flex-1 h-64 bg-slate-900 rounded-md p-4 overflow-y-auto">
                                {analyzeVideoError && <p className="text-red-400 text-sm">{analyzeVideoError}</p>}
                                {analyzeVideoResult && <div className="text-slate-300 whitespace-pre-wrap">{analyzeVideoResult}<SpeakButton text={analyzeVideoResult} /></div>}
                            </div>
                        </div>
                    </div>
                </div>
            </AITool>
             
            <AITool title="Audio Tools" description="Transcribe audio and have a real-time voice conversation." icon={<MicIcon className="h-8 w-8"/>}>
                <div className="space-y-6">
                    {/* Audio Transcription */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Audio Transcription</h4>
                        <div className="flex items-center space-x-4">
                            <button onClick={handleToggleRecording} className={`p-4 rounded-full transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-teal-600 hover:bg-teal-500'}`}><MicIcon className="h-6 w-6 text-white"/></button>
                            <p className="text-slate-300">{isRecording ? "Recording..." : (isTranscribing ? "Transcribing..." : "Click mic to start recording")}</p>
                        </div>
                        {transcriptionError && <p className="text-red-400 text-sm mt-2">{transcriptionError}</p>}
                        {transcription && <div className="mt-4 p-4 bg-slate-900 rounded-md text-slate-200">{transcription}<SpeakButton text={transcription} /></div>}
                    </div>
                    {/* Live Conversation */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Live Conversation (Gemini 2.5)</h4>
                        <div className="flex items-center space-x-4 mb-4">
                            {liveStatus === 'disconnected' || liveStatus === 'error' ? (
                                <button onClick={startLiveConversation} className="bg-green-600 font-semibold py-2 px-4 rounded-md hover:bg-green-500">Start Conversation</button>
                            ) : (
                                <button onClick={() => stopLiveConversation()} className="bg-red-600 font-semibold py-2 px-4 rounded-md hover:bg-red-500">End Conversation</button>
                            )}
                            <div className="flex items-center space-x-2">
                                <div className={`h-3 w-3 rounded-full ${liveStatus === 'connected' ? 'bg-green-400 animate-pulse' : (liveStatus === 'connecting' ? 'bg-yellow-400' : 'bg-slate-500')}`}></div>
                                <span className="text-slate-400 capitalize">{liveStatus}</span>
                            </div>
                        </div>
                        <div className="h-64 overflow-y-auto p-4 bg-slate-900 rounded-lg space-y-4">
                            {liveTranscription.map((turn, i) => (
                                <div key={i}>
                                    <p className="font-semibold text-teal-300">You: <span className="font-normal text-slate-300">{turn.user}</span></p>
                                    <p className="font-semibold text-purple-300">Gemini: <span className="font-normal text-slate-300">{turn.model}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AITool>

            <AITool title="Research Assistant" description="Get up-to-date answers and solve complex problems." icon={<SearchIcon className="h-8 w-8"/>}>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Grounded Search</h4>
                        <div className="space-y-2">
                            <textarea value={groundedQuery} onChange={e => setGroundedQuery(e.target.value)} placeholder="Who won the most medals at the last Olympics?" className="w-full h-24 bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none"/>
                            <div className="flex justify-between items-center">
                                <label className="flex items-center space-x-2 text-slate-300">
                                    <input type="checkbox" checked={useMaps} onChange={e => setUseMaps(e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-teal-500 focus:ring-teal-500"/>
                                    <span>Include location results <MapIcon className="inline h-4 w-4"/></span>
                                </label>
                                <button onClick={handleGroundedSearch} disabled={isGroundedLoading || !groundedQuery} className="bg-teal-600 font-semibold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 flex justify-center">{isGroundedLoading ? <LoadingSpinner/> : "Search"}</button>
                            </div>
                        </div>
                        {groundedError && <p className="text-red-400 text-sm mt-2">{groundedError}</p>}
                        {groundedResult.text && (
                            <div className="mt-4 p-4 bg-slate-900 rounded-md">
                                <div className="text-slate-200 whitespace-pre-wrap">{groundedResult.text}<SpeakButton text={groundedResult.text} /></div>
                                {groundedResult.chunks.length > 0 && <h5 className="text-sm font-semibold text-teal-300 mt-4 border-t border-slate-700 pt-2">Sources:</h5>}
                                <div className="text-xs space-y-1 mt-1">
                                    {groundedResult.chunks.map((chunk, i) => {
                                        const source = chunk.web || chunk.maps;
                                        return source ? <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline truncate">{source.title || source.uri}</a> : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Deep Analysis (Gemini 3 Pro + Thinking)</h4>
                        <div className="space-y-2">
                             <textarea value={complexQuery} onChange={e => setComplexQuery(e.target.value)} placeholder="Develop a comprehensive safety protocol for shielded metal arc welding in confined spaces, considering ventilation, atmospheric monitoring, and emergency rescue procedures." className="w-full h-32 bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-teal-500 focus:outline-none"/>
                            <button onClick={handleComplexQuery} disabled={isComplexLoading || !complexQuery} className="w-full bg-purple-600 font-semibold py-2 px-4 rounded-md hover:bg-purple-500 disabled:bg-slate-600 flex justify-center items-center space-x-2">{isComplexLoading ? <LoadingSpinner/> : <BrainCircuitIcon className="h-5 w-5"/>} <span>Analyze</span></button>
                        </div>
                        {complexError && <p className="text-red-400 text-sm mt-2">{complexError}</p>}
                        {complexResult && <div className="mt-4 p-4 bg-slate-900 rounded-md text-slate-200 whitespace-pre-wrap">{complexResult}<SpeakButton text={complexResult} /></div>}
                    </div>
                </div>
            </AITool>

            <AITool title="AI Code Mentor & Bio" description="Get help with code clauses and your professional profile." icon={<SparklesIcon className="h-8 w-8" />}>
                <div className="space-y-6">
                    <ClauseInvestigator />
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                            AI Bio Assistant
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Not sure what to write? Enter some keywords and let AI craft a professional bio for you.</p>
                        <div className="space-y-4">
                            <input type="text" value={bioKeywords} onChange={(e) => setBioKeywords(e.target.value)} placeholder="e.g., structural steel, CWI, API 1104" className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                            <button onClick={handleGenerateBio} disabled={isGenerating || !bioKeywords} className="w-full flex justify-center items-center bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 disabled:bg-slate-600">
                            {isGenerating ? <LoadingSpinner /> : 'Generate Bio'}
                            </button>
                            {aiError && <p className="text-sm text-red-400 mt-2">{aiError}</p>}
                        </div>
                    </div>
                </div>
            </AITool>
        </div>
    );
};

export default AITools;