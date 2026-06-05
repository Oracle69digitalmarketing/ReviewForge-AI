import React, { useState } from 'react';
import { 
  MessageSquare, Sparkles, Star, 
  Loader2, BrainCircuit, Mic2, Heart,
  ArrowRight, Landmark, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_USERS = [
  { 
    id: 'u1', 
    name: 'Tunde from Lagos', 
    tag: 'Lagos Foodie',
    history: [
      { item_name: 'Yellow Chilli', rating: 5, text: 'Omo! The seafood okro slap well well. Best in Lagos sha.' },
      { item_name: 'Hard Rock Cafe', rating: 4, text: 'Vibes were on point. But that burger take time small.' },
      { item_name: 'Stay With Me', rating: 5, text: 'Correct amala! No cap. I go come back every Friday.' }
    ] 
  },
  { 
    id: 'u2', 
    name: 'Ngozi', 
    tag: 'Tech Critique',
    history: [
      { item_name: 'Nok by Alara', rating: 3, text: 'Ambience is great but the portion size is just too small for that price.' },
      { item_name: 'Oraimo FreePods 4', rating: 5, text: 'Clear sound and the battery dey last well well.' }
    ] 
  }
];

const MOCK_ITEMS = [
  { id: 'y1', domain: 'yelp', name: 'Nok by Alara', location: 'Victoria Island' },
  { id: 'y2', domain: 'yelp', name: 'Amala Shitta', location: 'Surulere' },
  { id: 'a1', domain: 'amazon', name: 'Oraimo FreePods 4', location: 'Online' },
  { id: 'a2', domain: 'amazon', name: 'Power King Blender', location: 'Online' },
  { id: 'g1', domain: 'goodreads', name: 'Stay With Me', location: 'Lagos Library' },
  { id: 'g2', domain: 'goodreads', name: 'Americanah', location: 'Bookstore' }
];

export default function App() {
  const [selectedUser] = useState({...MOCK_USERS[0], name: 'Custom User'});
  const [activeTab, setActiveTab] = useState('modeling');
  const [userName, setUserName] = useState('New User');
  const [customHistory, setCustomHistory] = useState('');
  const [persona, setPersona] = useState<any>(null);
  const [personaOptions, setPersonaOptions] = useState<any[] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedSample, setSelectedSample] = useState<'yelp' | 'amazon' | 'goodreads' | null>(null);

  const loadSample = (type: 'yelp' | 'amazon' | 'goodreads') => {
    const samples = {
      yelp: "Yelp Review: [Amala Shitta] - 5 Stars. Best spot in Surulere. The efo riro is legendary.\nYelp Review: [The Place] - 3 Stars. Food is okay but the queue is longer than bridge.",
      amazon: "Amazon Review: [Oraimo Powerbank] - 5 Stars. This thing is a beast. Charges my phone 4 times.\nAmazon Review: [Cheap Charger] - 1 Star. It burnt my cable within 2 days. Waste of money.",
      goodreads: "Goodreads Review: [Things Fall Apart] - 5 Stars. A masterpiece that defined our identity.\nGoodreads Review: [Americanah] - 4 Stars. Adichie's commentary on race and hair is top tier."
    };
    setCustomHistory(samples[type]);
    setSelectedSample(type);
  };
  const [simulation, setSimulation] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [simTarget, setSimTarget] = useState(MOCK_ITEMS[1]); 

  const startVoiceInput = (target: 'query' | 'history') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Speech recognition is not supported in this browser.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-NG'; // Nigerian English!
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      setErrorMsg(`Voice Error: ${event.error}`);
      setTimeout(() => setErrorMsg(null), 3000);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (target === 'query') {
        setQuery(transcript);
      } else {
        setCustomHistory(prev => prev ? `${prev}\n${transcript}` : transcript);
        setSelectedSample(null);
      }
    };

    recognition.start();
  };
  const [query, setQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatState, setChatState] = useState<string>('');

  const extractPersona = async () => {
    setIsExtracting(true);
    const historyToProcess = customHistory || JSON.stringify(selectedUser.history);
    try {
      const res = await fetch('/api/extract-persona-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historyToProcess })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPersonaOptions(data);
        setPersona(data[0]);
      } else {
        setPersona(data);
        setPersonaOptions(null);
      }
      setActiveTab('modeling');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const simulateReview = async () => {
    setIsSimulating(true);
    const historyToProcess = customHistory || JSON.stringify(selectedUser.history);
    try {
      const res = await fetch('/task_a/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_name: userName, 
          item_id: simTarget.id,
          history: historyToProcess,
          persona: persona
        })
      });
      const data = await res.json();
      setSimulation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const getRecommendations = async () => {
    setIsRecommending(true);
    const currentQuery = query || "Suggest something I'd like based on my profile";
    const historyToProcess = customHistory || JSON.stringify(selectedUser.history);
    
    // Add user message to local chat
    setChatHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
    
    try {
      const res = await fetch('/task_b/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: selectedUser.id,
          history: historyToProcess,
          query: currentQuery,
          conversation_state: chatState
        })
      });
      const data = await res.json();
      setRecommendations(data.ranked_items || []);
      setChatState(data.updated_state);
      
      // Add assistant summary to chat
      if (data.ranked_items?.[0]) {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `I've found some spots for you. My top pick is ${data.ranked_items[0].name}. ${data.ranked_items[0].explanation}` 
        }]);
      }
      setQuery('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecommending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-green-500/30">
      {/* Header */}
      <nav className="border-b border-white/5 py-4 px-8 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">ReviewForge <span className="text-green-500">AI</span></span>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => setActiveTab('modeling')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'modeling' ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}>Persona</button>
          <button onClick={() => setActiveTab('simulation')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'simulation' ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}>Simulator</button>
          <button onClick={() => setActiveTab('recommendation')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'recommendation' ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}>Agentic Chat</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
        {/* Left Column: Data Ingestion & Persona */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
            <h2 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Data Ingestion
            </h2>
            
            <div className="space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-2 rounded-lg font-bold animate-appearance-in">
                  {errorMsg}
                </div>
              )}
              <label className="block">
                <span className="text-[10px] text-zinc-500 uppercase font-black mb-2 block">Identity</span>
                <input 
                  type="text"
                  placeholder="Enter User Name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-1 focus:ring-green-500 outline-none"
                />
              </label>

              <label className="block">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block">Feed Gallery (Select One Suggestion)</span>
                  <button 
                    onClick={() => startVoiceInput('history')}
                    className={`p-1 rounded-md transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-600 hover:text-white'}`}
                    title="Speak your history"
                  >
                    <Mic2 size={14} />
                  </button>
                </div>
                <textarea 
                  className="w-full h-24 bg-black border border-white/10 rounded-2xl p-4 text-xs font-mono focus:ring-1 focus:ring-green-500 outline-none resize-none leading-relaxed"
                  placeholder="Select a suggestion from the gallery or paste reviews..."
                  value={customHistory}
                  onChange={(e) => {
                    setCustomHistory(e.target.value);
                    setSelectedSample(null);
                  }}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => loadSample('yelp')} 
                  className={`px-3 py-1.5 border rounded-lg text-[9px] font-black transition-all uppercase tracking-widest ${selectedSample === 'yelp' ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-green-500'}`}
                >
                  Yelp Suggestion
                </button>
                <button 
                  onClick={() => loadSample('amazon')} 
                  className={`px-3 py-1.5 border rounded-lg text-[9px] font-black transition-all uppercase tracking-widest ${selectedSample === 'amazon' ? 'bg-blue-600/20 border-blue-500 text-blue-500' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-blue-500'}`}
                >
                  Amazon Suggestion
                </button>
                <button 
                  onClick={() => loadSample('goodreads')} 
                  className={`px-3 py-1.5 border rounded-lg text-[9px] font-black transition-all uppercase tracking-widest ${selectedSample === 'goodreads' ? 'bg-yellow-600/20 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-yellow-500'}`}
                >
                  Goodreads Suggestion
                </button>
              </div>
            </div>

            <button 
              onClick={extractPersona}
              disabled={isExtracting || (!customHistory && !selectedUser.history)}
              className="w-full mt-6 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
            >
              {isExtracting ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
              Generate Digital Twin
            </button>
          </section>

          <AnimatePresence>
            {persona && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-6 text-green-500">
                  <Heart size={16} />
                  <h3 className="font-black text-sm uppercase tracking-widest">Linguistic Fingerprint</h3>
                </div>

                {personaOptions && (
                  <div className="mb-4 space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-black block">Switch Persona Profile</span>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {personaOptions.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPersona(p)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${persona === p ? 'bg-green-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                        >
                          {p.user_id || `Profile ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs font-medium leading-relaxed italic text-zinc-300">“{persona.persona_summary}”</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {persona.exclamations?.slice(0, 4).map((ex: string) => (
                      <span key={ex} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-zinc-400">{ex}</span>
                    ))}
                    {persona.pidgin_markers?.slice(0, 4).map((pm: string) => (
                      <span key={pm} className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-[9px] font-bold text-green-500">{pm}</span>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Tab Content */}
        <div className="lg:col-span-8">
          <div className="min-h-[650px] bg-[#090909] border border-white/5 rounded-3xl p-8 flex flex-col shadow-inner">
            <AnimatePresence mode="wait">
              {activeTab === 'modeling' && (
                <motion.div 
                  key="mod"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <BrainCircuit className="text-green-500 w-16 h-16 mb-6 opacity-20" />
                  <h3 className="text-3xl font-black tracking-tighter mb-4">Neural User Modeling</h3>
                  <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Analyzing rating tendencies, behavioral patterns, and cultural nuances. 
                    Input a history on the left to see the engine in action.
                  </p>
                </motion.div>
              )}

              {activeTab === 'simulation' && (
                <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-[#111] p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${simTarget.domain === 'yelp' ? 'bg-green-500/10 text-green-500' : simTarget.domain === 'amazon' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {simTarget.domain === 'yelp' ? <Utensils size={24} /> : simTarget.domain === 'amazon' ? <Sparkles size={24} /> : <Landmark size={24} />}
                      </div>
                      <div>
                        <div className="font-black text-xl">{simTarget.name}</div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2 uppercase font-black">
                          <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{simTarget.domain}</span>
                          • {simTarget.location || 'Distributed'}
                        </div>
                      </div>
                    </div>
                    <select 
                      value={simTarget.id}
                      onChange={(e) => setSimTarget(MOCK_ITEMS.find(i => i.id === e.target.value)!)}
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:ring-1 focus:ring-green-500 outline-none"
                    >
                      {MOCK_ITEMS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>

                  <button 
                    onClick={simulateReview}
                    disabled={isSimulating}
                    className="w-full py-4 bg-green-600 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-green-500 transition-all active:scale-[0.98]"
                  >
                    {isSimulating ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    Run Agentic Simulation
                  </button>

                  <AnimatePresence>
                    {simulation && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                             <BrainCircuit size={12} className="text-zinc-600" />
                             <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Reasoning</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 italic">“{simulation.internal_cot}”</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-1 text-green-500">
                              {[...Array(simulation.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                            {simulation.fidelity_score && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Neural Fidelity: {simulation.fidelity_score}%</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xl font-medium text-white italic leading-relaxed">“{simulation.review_text}”</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'recommendation' && (
                <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                    {chatHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                         <MessageSquare size={48} className="mb-4" />
                         <p className="text-xs font-black uppercase tracking-widest">Start a conversation to find tailored spots</p>
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-green-600 text-white font-medium' : 'bg-zinc-900 border border-white/10 text-zinc-300'}`}>
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {recommendations.length > 0 && activeTab === 'recommendation' && (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {recommendations.map((item, idx) => (
                        <div key={item.id} className="min-w-[280px] bg-[#111] p-5 rounded-3xl border border-white/5 shrink-0 hover:border-green-500/30 transition-all">
                          <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Recommendation #{idx+1}</div>
                          <h4 className="font-black text-lg mb-1 leading-tight">{item.name}</h4>
                          <p className="text-[10px] text-zinc-500 mb-3">{item.location} • {item.price_range || item.domain}</p>
                          <p className="text-[11px] text-zinc-400 italic bg-black/40 p-3 rounded-xl border border-white/5">“{item.explanation}”</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto relative">
                    <input 
                      type="text"
                      placeholder="I want somewhere spicy but chill..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && getRecommendations()}
                      className="w-full bg-zinc-900 border border-white/10 py-5 pl-6 pr-32 rounded-3xl text-sm font-bold focus:ring-1 focus:ring-green-500 outline-none"
                    />
                    <div className="absolute right-3 top-3 bottom-3 flex gap-2">
                      <button 
                        onClick={() => startVoiceInput('query')}
                        disabled={isListening}
                        className={`px-4 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
                        title="Voice Search"
                      >
                        <Mic2 size={16} />
                      </button>
                      <button 
                        onClick={getRecommendations}
                        disabled={isRecommending || !persona}
                        className="px-6 bg-green-600 hover:bg-green-500 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-20 transition-all flex items-center justify-center"
                      >
                        {isRecommending ? <Loader2 className="animate-spin" size={14} /> : <ArrowRight size={14} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-white/5 text-[10px] flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <Landmark size={20} />
          <span>Real-world Dataset Engine: Yelp • Amazon • Goodreads</span>
        </div>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 saturate-0">DSN x BCT Hackathon 3.0</span>
          <span className="text-green-900">70%+ Human Fidelity Target</span>
        </div>
      </footer>
    </div>
  );
}
