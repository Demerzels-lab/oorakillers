import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ChevronDown, Skull, Zap, Target, AlertCircle, Save, Share2, ImageIcon, Heart, Activity, Lock, AlertTriangle, FileText, Search, Radio, Wifi, Copy } from 'lucide-react';
import { supabase } from './lib/supabase';
import GalleryPage from './pages/GalleryPage';

// --- DATA CONSTANTS ---
const HEADS = ['Tiger', 'Lion', 'Wolf', 'Bear', 'Crocodile', 'Shark', 'Eagle', 'Cobra'];
const BODIES = ['Komodo', 'Rhino', 'Gorilla', 'Panther', 'Bull', 'Hippo', 'Elephant'];
const TAILS = ['Eagle', 'Scorpion', 'Snake', 'Dragon', 'Fox', 'Peacock', 'Stingray'];
const BIOMES = ['jungle', 'savanna', 'desert', 'tundra', 'wetlands', 'mountains'];

const IMAGE_POOL = [
  { heads: ['tiger'], bodies: ['komodo'], tails: ['eagle'], img: 'hero_predator_2048.png' },
  { heads: ['wolf', 'fox'], bodies: ['rhino', 'bull'], tails: ['stingray', 'peacock'], img: 'predator_wolf_rhino_stingray.png' },
  { heads: ['lion', 'eagle'], bodies: ['gorilla'], tails: ['scorpion'], img: 'predator_lion_gorilla_scorpion.png' },
  { heads: ['bear'], bodies: ['panther'], tails: ['snake', 'fox'], img: 'predator_bear_panther_snake.png' },
  { heads: ['crocodile'], bodies: ['hippo'], tails: ['dragon'], img: 'predator_croc_hippo_dragon.png' },
  { heads: ['shark', 'cobra'], bodies: ['elephant'], tails: ['cobra', 'eagle'], img: 'predator_shark_elephant_cobra.png' },
];

function findBestMatch(head: string, body: string, tail: string): string {
  const h = head.toLowerCase();
  const b = body.toLowerCase();
  const t = tail.toLowerCase();
  let bestScore = -1;
  let bestImg = 'hero_predator_2048.png';
  for (const pool of IMAGE_POOL) {
    let score = 0;
    if (pool.heads.includes(h)) score += 3;
    if (pool.bodies.includes(b)) score += 2;
    if (pool.tails.includes(t)) score += 1;
    if (score > bestScore) { bestScore = score; bestImg = pool.img; }
  }
  return bestImg;
}

const headTraits: Record<string, string> = { Tiger: 'razor-sharp fangs', Lion: 'regal mane', Wolf: 'pack-instinct', Bear: 'bone-crushing jaws', Crocodile: 'death-roll grip', Shark: 'electroreceptor targeting', Eagle: 'telescopic vision', Cobra: 'hypnotic gaze' };
const bodyTraits: Record<string, string> = { Komodo: 'armor-plated hide', Rhino: 'two-ton battering ram', Gorilla: 'raw primate strength', Panther: 'shadow-black stealth', Bull: 'muscular frame', Hippo: 'deceptively fast bulk', Elephant: 'titanic mass' };
const tailTraits: Record<string, string> = { Eagle: 'razor-feathered tail', Scorpion: 'venomous stinger', Snake: 'whip-like tail', Dragon: 'barbed appendage', Fox: 'bushy tail', Peacock: 'hypnotic display', Stingray: 'serrated barb' };
const biomeIntros: Record<string, string> = { jungle: 'In the dense jungle,', savanna: 'Across the sun-scorched savanna,', desert: 'Through the merciless desert,', tundra: 'In the frozen tundra,', wetlands: 'From the murky wetlands,', mountains: 'Down the jagged cliffs,' };
const PUNCHLINES = ["Nature's most efficient design.", "OORA never stood a chance.", "The food chain has spoken."];
const PREDATOR_FACTS = ["The Tiger can reach speeds of 65 km/h...", "A Komodo dragon's venom causes blood loss...", "Sharks can detect one drop of blood..."];

interface GenerationResult {
  imageUrl: string; head: string; body: string; tail: string; biome: string; narrative: string;
}

function generatePredator(head: string, body: string, tail: string): GenerationResult {
  const biome = BIOMES[Math.floor(Math.random() * BIOMES.length)];
  const time = (Math.random() * 5 + 1).toFixed(1);
  const punchline = PUNCHLINES[Math.floor(Math.random() * PUNCHLINES.length)];
  const narrative = `${biomeIntros[biome]} the ${head}-headed beast surveys its domain. With ${headTraits[head] || 'power'}, it locks onto OORA. Its ${body} frame provides ${bodyTraits[body] || 'strength'}. The ${tail} tail seals its fate. Hunt time: ${time}s. ${punchline}`;
  return { imageUrl: `/images/${findBestMatch(head, body, tail)}`, head, body, tail, biome, narrative };
}

// OORA Style Select
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative font-mono">
      <label className="text-[#333] text-xs font-bold mb-1 block uppercase tracking-wider">{label}</label>
      <button 
        onClick={() => setOpen(!open)}
        className="w-full bg-white border-2 border-[#1a1a1a] p-3 text-left flex justify-between items-center hover:bg-gray-50 active:translate-y-1 transition-all"
      >
        <span className="text-[#1a1a1a] font-bold uppercase">{value || 'SELECT...'}</span>
        <ChevronDown className="w-4 h-4 text-[#DC2626]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 border-2 border-t-0 border-[#1a1a1a] bg-white z-50 max-h-48 overflow-auto shadow-xl">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className="w-full p-2 text-left hover:bg-[#DC2626] hover:text-white font-bold uppercase text-sm border-b border-gray-100">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage() {
  const [head, setHead] = useState('');
  const [body, setBody] = useState('');
  const [tail, setTail] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFact, setLoadingFact] = useState('');
  const [saved, setSaved] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => generatorRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (loading) {
      setLoadingFact(PREDATOR_FACTS[Math.floor(Math.random() * PREDATOR_FACTS.length)]);
      const interval = setInterval(() => setLoadingFact(PREDATOR_FACTS[Math.floor(Math.random() * PREDATOR_FACTS.length)]), 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleGenerate = () => {
    if (!head || !body || !tail) return;
    setLoading(true);
    setSaved(false);
    setTimeout(() => {
      setResult(generatePredator(head, body, tail));
      setLoading(false);
    }, 2000);
  };

  const handleSaveToGallery = async () => {
    if (!result) return;
    const name = creatorName.trim() || 'Anonymous';
    const { error } = await supabase.from('predators').insert({
      head: result.head, body: result.body, tail: result.tail, biome: result.biome,
      image_url: result.imageUrl, narrative: result.narrative, creator_name: name, likes: 0,
    });
    if (!error) { setSaved(true); setShowNamePrompt(false); }
  };

  return (
    <div className="min-h-screen font-body relative">
      <div className="fixed inset-0 crt-scanlines"></div>
      <div className="fixed inset-0 crt-vignette"></div>

      {/* --- OORA HEADER --- */}
      <nav className="fixed top-0 w-full z-40 bg-black/90 border-b border-[#333] px-4 py-2 flex justify-between items-center">
         <div className="font-display font-black text-xl text-[#DC2626] tracking-tighter flex items-center gap-2">
           <Radio className="w-5 h-5 animate-pulse" />
           OORAKILLERS 
         </div>
         <Link to="/gallery" className="font-mono font-bold text-sm text-gray-200 hover:text-white hover:underline flex items-center gap-1 border border-[#333] px-2 py-1 rounded-sm">
           <Search className="w-3 h-3" /> ARCHIVE_DB
         </Link>
      </nav>

      {/* --- SECTION 1: CONTAINMENT CARD (HERO) --- */}
      <section className="pt-24 pb-12 px-4 flex justify-center bg-[#050505]">
        <div className="w-full max-w-6xl border-4 border-[#222] bg-[#0a0a0a] shadow-2xl relative overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-[#111] p-4 border-b-2 border-[#333] flex justify-between items-center">
             <h1 className="font-display font-black text-3xl md:text-5xl text-white">
               <span className="blink-text text-[#DC2626] mr-2">⚠</span>
               $OORA BREACH:
             </h1>
             <div className="hidden md:block font-mono text-xs text-[#444] text-right">
               <div>CASE: 9810-X</div>
               <div>AUTH: LEVEL 5</div>
             </div>
          </div>

          {/* Status Window (Split View) */}
          <div className="flex flex-col md:flex-row">
            
            {/* Mugshot Column (Widened to 6/12 and changed aspect ratio) */}
            <div className="md:w-6/12 p-6 bg-[#080808] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#333]">
              {/* Changed max-w-sm to max-w-full and aspect-[4/5] to aspect-video */}
              <div className="mugshot-frame w-full relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <img 
                  src="/images/hero_canonical_desktop.png" 
                  className="w-full h-auto object-contain opacity-90 grayscale contrast-125" 
                  alt="Subject" 
                />
                <div className="glass-overlay absolute inset-0"></div>
                <div className="absolute top-2 right-2 stamp text-[#DC2626] border-[#DC2626] text-xs">ESCAPED</div>
                
                {/* OORA Timestamp Plate */}
                <div className="absolute bottom-0 left-0 right-0 timestamp-plate text-xs md:text-sm">
                  JAIL 50:02 | 1 13 26
                </div>
              </div>
            </div>

            {/* Data Column (Adjusted to 6/12 to match) */}
            <div className="md:w-6/12 p-6 bg-[#0a0a0a] flex flex-col justify-center">
               <div className="mb-6">
                 <div className="data-row">
                   <span className="data-label">ASSET:</span>
                   <span className="data-value text-white">$OORA (HYBRID)</span>
                 </div>
                 <div className="data-row">
                   <span className="data-label">STATUS:</span>
                   <span className="data-value text-[#DC2626] blink-text">CONTAINMENT FAILED</span>
                 </div>
                 <div className="data-row">
                   <span className="data-label">THREAT:</span>
                   <span className="data-value text-[#DC2626]">MAXIMUM</span>
                 </div>
                 <div className="data-row">
                   <span className="data-label">LAST SEEN:</span>
                   <span className="data-value text-[#666]">SECTOR 7 (JUNGLE)</span>
                 </div>
               </div>

               <div className="bg-[#111] p-4 border border-[#333] mb-6">
                 <p className="font-mono text-xs text-[#888] leading-relaxed">
                   <span className="text-[#DC2626] font-bold">&gt;&gt; ALERT:</span> Subject has breached containment. Conventional weapons ineffective. Authorization granted to generate genetic countermeasures immediately.
                 </p>
               </div>

               <button 
                 onClick={scrollToGenerator}
                 className="brutalist-button w-full text-center"
               >
                 INITIATE GENERATOR
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: GLOBAL SURVEILLANCE --- */}
      <section className="py-12 bg-[#020202] border-t border-b border-[#222] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
              <Wifi className="text-[#DC2626] animate-pulse" /> GLOBAL SURVEILLANCE
            </h2>
            <div className="flex gap-4 font-mono text-[10px] text-[#444]">
              <span className="text-green-500">● SYSTEM ONLINE</span>
              <span>BW: 4059 TB/s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CAM 1 */}
            <div className="bg-black border border-[#333] p-1 relative group">
              <div className="absolute top-3 left-3 z-10 bg-black/50 text-white font-mono text-[10px] px-1 border border-white/10">CAM_04: SWAMP</div>
              <div className="aspect-video relative overflow-hidden">
                <img src="/images/predator_croc_hippo_dragon.png" className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
              </div>
              <div className="mt-1 flex justify-between px-2 font-mono text-[10px] text-[#444]">
                <span>REC •</span>
                <span>MOVEMENT DETECTED</span>
              </div>
            </div>

            {/* CAM 2 */}
            <div className="bg-black border border-[#333] p-1 relative group">
              <div className="absolute top-3 left-3 z-10 bg-black/50 text-white font-mono text-[10px] px-1 border border-white/10">CAM_09: SAVANNA</div>
              <div className="aspect-video relative overflow-hidden">
                <img src="/images/predator_lion_gorilla_scorpion.png" className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
              </div>
              <div className="mt-1 flex justify-between px-2 font-mono text-[10px] text-[#444]">
                <span>REC •</span>
                <span>TARGET ACQUIRED</span>
              </div>
            </div>

            {/* CAM 3 - Data Stream */}
            <div className="bg-[#050505] border border-[#333] p-4 relative overflow-hidden font-mono text-[10px] text-green-900 leading-tight">
               <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                 <div className="border border-green-800 text-green-600 px-3 py-1 bg-green-900/10 tracking-widest font-bold">SIGNAL ENCRYPTED</div>
               </div>
               {Array.from({length: 15}).map((_,i) => (
                 <div key={i} className="opacity-30 whitespace-nowrap">
                   {Math.random().toString(16).substring(2)}{Math.random().toString(16).substring(2)}... [PACKET_LOSS]
                 </div>
               ))}
            </div>
          </div>

          {/* Scrolling Ticker */}
          <div className="mt-8 border-t border-[#222] pt-2 overflow-hidden">
             <div className="whitespace-nowrap font-mono text-xs text-[#444] animate-pulse">
               WARNING: GENETIC ANOMALIES DETECTED IN SECTORS 4, 7, 9   ///   CIVILIAN EVACUATION ORDER IN EFFECT   ///   REPORT ALL SIGHTINGS OF 'OORA' IMMEDIATELY   ///   DO NOT APPROACH
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: MANILA FOLDER (GENERATOR) --- */}
      <section ref={generatorRef} className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-[#1a1a1a] z-0"></div>
        
        <div className="manila-folder max-w-4xl mx-auto p-1 shadow-2xl relative z-10 transform rotate-1">
          <div className="absolute -top-8 left-0 bg-[#F0E6D2] px-8 py-2 rounded-t-lg font-mono font-bold text-[#1a1a1a] border-t border-x border-[#dcd0b0]">
            CONFIDENTIAL // CASE #98103
          </div>

          <div className="border-2 border-[#dcd0b0] p-6 md:p-12 relative h-full">
            <div className="absolute top-6 right-6 stamp text-[#DC2626] border-[#DC2626] text-xl opacity-50 rotate-[-15deg]">TOP SECRET</div>
            
            <h2 className="font-display font-black text-3xl text-[#1a1a1a] mb-8 border-b-4 border-[#1a1a1a] pb-2 inline-block">
              COUNTERMEASURE LAB
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Select label="HEAD DNA" value={head} options={HEADS} onChange={setHead} />
              <Select label="BODY DNA" value={body} options={BODIES} onChange={setBody} />
              <Select label="TAIL DNA" value={tail} options={TAILS} onChange={setTail} />
            </div>

            <div className="bg-white p-3 shadow-lg transform rotate-[-1deg] max-w-sm mx-auto mb-8 border border-gray-200">
              <div className="bg-[#111] overflow-hidden relative">
                 {loading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-mono text-xs">
                     <div className="w-12 h-12 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin mb-4"></div>
                     <span className="blink-text">PROCESSING DNA...</span>
                     <div className="mt-2 text-[#666] text-center px-4">{loadingFact}</div>
                   </div>
                 ) : result ? (
                   <img src={result.imageUrl} className="w-full h-auto object-contain" alt="Result" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-[#333] font-mono uppercase text-sm">
                     [ AWAITING INPUT ]
                   </div>
                 )}
              </div>
              <div className="font-handwriting font-mono text-xs text-center mt-2 text-gray-500">
                Fig 1.1 - Genetic Simulation
              </div>
            </div>

            {result && (
              <div className="bg-white/50 border border-[#dcd0b0] p-4 mb-8 font-mono text-sm leading-relaxed text-[#333]">
                <p><span className="font-bold">NARRATIVE LOG:</span> {result.narrative}</p>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-center">
               <button 
                 onClick={handleGenerate} 
                 disabled={loading}
                 className="bg-[#1a1a1a] text-white font-mono font-bold uppercase px-8 py-3 hover:bg-[#333] transition-colors border-2 border-transparent"
               >
                 {loading ? 'RUNNING SIMULATION...' : 'RUN SIMULATION'}
               </button>
               
               {result && !saved && (
                 <button 
                   onClick={() => setShowNamePrompt(true)}
                   className="border-2 border-[#1a1a1a] text-[#1a1a1a] font-mono font-bold uppercase px-8 py-3 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                 >
                   ARCHIVE TO FILE
                 </button>
               )}
               
               {result && (
                 <button 
                   onClick={() => {
                     const text = encodeURIComponent(`Check out this OORA killer I created: ${result.narrative}`);
                     window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                   }}
                   className="border-2 border-[#1a1a1a] text-[#1a1a1a] font-mono font-bold uppercase px-8 py-3 hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center gap-2"
                 >
                   <Share2 className="w-4 h-4" /> SHARE TO X
                 </button>
               )}
            </div>

          </div>
        </div>
      </section>

      {/* --- CA SECTION --- */}
      {/* <section className="py-12 bg-[#020202] border-t border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#111] p-4 border border-[#333]">
            <div className="data-row">
              <span className="data-label">CONTRACT ADDRESS:</span>
              <div className="flex items-center">
                <span className="data-value text-white">0xDummyAddress1234567890ABCDEF</span>
                <button onClick={() => navigator.clipboard.writeText('0xDummyAddress1234567890ABCDEF')} className="ml-2 text-[#666] hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* --- FOOTER --- */}
      <footer className="bg-[#111] border-t border-[#333] py-8 text-center">
         <div className="font-mono text-xs text-[#444]">
           OORA ASSET CONTAINMENT UNIT // AUTHORIZED PERSONNEL ONLY
         </div>
      </footer>

      {/* --- MODAL --- */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
           <div className="bg-[#111] border-2 border-[#DC2626] p-8 max-w-md w-full shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <h3 className="font-display text-white text-xl mb-4">CONFIRM ARCHIVAL</h3>
              <input 
                type="text" 
                placeholder="ENTER AGENT NAME" 
                className="w-full bg-black border border-[#333] text-white p-3 font-mono mb-4 focus:border-[#DC2626] outline-none uppercase"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
              />
              <div className="flex gap-4">
                <button onClick={() => setShowNamePrompt(false)} className="flex-1 text-[#666] hover:text-white font-mono text-sm">CANCEL</button>
                <button onClick={handleSaveToGallery} className="flex-1 bg-[#DC2626] text-white font-bold p-3 font-mono hover:bg-red-600">CONFIRM</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </BrowserRouter>
  );
}