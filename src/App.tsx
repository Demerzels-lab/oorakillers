import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Skull, Zap, Target, AlertCircle } from 'lucide-react';

// Animal presets
const HEADS = ['Tiger', 'Lion', 'Wolf', 'Bear', 'Crocodile', 'Shark', 'Eagle', 'Cobra'];
const BODIES = ['Komodo', 'Rhino', 'Gorilla', 'Panther', 'Bull', 'Hippo', 'Elephant'];
const TAILS = ['Eagle', 'Scorpion', 'Snake', 'Dragon', 'Fox', 'Peacock', 'Stingray'];
const BIOMES = ['jungle', 'savanna', 'desert', 'tundra', 'wetlands', 'mountains'];

// Image pool with match criteria
const IMAGE_POOL = [
  { heads: ['tiger'], bodies: ['komodo'], tails: ['eagle'], img: 'hero_predator_2048.png' },
  { heads: ['wolf', 'fox'], bodies: ['rhino', 'bull'], tails: ['stingray', 'peacock'], img: 'predator_wolf_rhino_stingray.png' },
  { heads: ['lion', 'eagle'], bodies: ['gorilla'], tails: ['scorpion'], img: 'predator_lion_gorilla_scorpion.png' },
  { heads: ['bear'], bodies: ['panther'], tails: ['snake', 'fox'], img: 'predator_bear_panther_snake.png' },
  { heads: ['crocodile'], bodies: ['hippo'], tails: ['dragon'], img: 'predator_croc_hippo_dragon.png' },
  { heads: ['shark', 'cobra'], bodies: ['elephant'], tails: ['cobra', 'eagle'], img: 'predator_shark_elephant_cobra.png' },
];

// Predator facts for loading state
const PREDATOR_FACTS = [
  "The Tiger can reach speeds of 65 km/h in short bursts...",
  "A Komodo dragon's venom causes massive blood loss...",
  "Sharks can detect one drop of blood in 25 gallons of water...",
  "Eagles have 20/4 vision - 8x better than humans...",
  "The Scorpion's venom attacks the nervous system in milliseconds...",
  "Crocodiles have the strongest bite force of any animal...",
  "A Panther can leap up to 20 feet horizontally...",
  "Wolf packs can travel 30 miles per day while hunting...",
];

// Find best matching image based on selection
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
    
    if (score > bestScore) {
      bestScore = score;
      bestImg = pool.img;
    }
  }
  
  return bestImg;
}

// Head traits for narrative
const headTraits: Record<string, string> = {
  Tiger: 'razor-sharp fangs and night-vision precision',
  Lion: 'regal mane and thunderous roar',
  Wolf: 'pack-instinct cunning and relentless tracking',
  Bear: 'bone-crushing jaws and unstoppable force',
  Crocodile: 'death-roll grip and prehistoric patience',
  Shark: 'electroreceptor targeting and serrated teeth',
  Eagle: 'telescopic vision and calculated dive',
  Cobra: 'hypnotic gaze and lightning-fast strike',
};

// Body traits
const bodyTraits: Record<string, string> = {
  Komodo: 'armor-plated hide carries venomous bacteria',
  Rhino: 'two-ton battering ram demolishes all obstacles',
  Gorilla: 'raw primate strength tears through terrain',
  Panther: 'shadow-black stealth moves without sound',
  Bull: 'muscular frame builds unstoppable momentum',
  Hippo: 'deceptively fast bulk crushes anything in its path',
  Elephant: 'titanic mass shakes the earth with each step',
};

// Tail traits
const tailTraits: Record<string, string> = {
  Eagle: 'razor-feathered tail provides perfect aerial control',
  Scorpion: 'venomous stinger delivers paralytic doom',
  Snake: 'whip-like tail constricts with crushing force',
  Dragon: 'barbed appendage sweeps with mythic fury',
  Fox: 'bushy tail provides deceptive misdirection',
  Peacock: 'hypnotic display distracts before the kill',
  Stingray: 'serrated barb injects neurotoxic venom',
};

// Biome descriptions
const biomeIntros: Record<string, string> = {
  jungle: 'In the dense jungle, where ancient vines strangle forgotten temples,',
  savanna: 'Across the sun-scorched savanna, where the tall grass whispers of death,',
  desert: 'Through the merciless desert dunes, where heat mirages blur the horizon,',
  tundra: 'In the frozen tundra wasteland, where blizzards mask approaching doom,',
  wetlands: 'From the murky wetland depths, where rotting vegetation conceals predators,',
  mountains: 'Down the jagged mountain cliffs, where echoes carry screams for miles,',
};

// Random punchlines
const PUNCHLINES = [
  "Nature's most efficient design.",
  "OORA never stood a chance.",
  "Evolution's masterpiece strikes again.",
  "Another day, another perfect kill.",
  "The food chain has spoken.",
  "Survival of the fittest, indeed.",
];

interface GenerationResult {
  imageUrl: string;
  animals: string[];
  biome: string;
  narrative: string;
}

function generatePredator(head: string, body: string, tail: string): GenerationResult {
  const biome = BIOMES[Math.floor(Math.random() * BIOMES.length)];
  const time = (Math.random() * 5 + 1).toFixed(1);
  const punchline = PUNCHLINES[Math.floor(Math.random() * PUNCHLINES.length)];
  
  const intro = biomeIntros[biome];
  const headDesc = headTraits[head] || 'predatory instincts';
  const bodyDesc = bodyTraits[body] || 'devastating power';
  const tailDesc = tailTraits[tail] || 'lethal precision';
  
  const narrative = `${intro} the ${head}-headed beast surveys its domain. With ${headDesc}, it locks onto OORA's pathetic trembling form. Its ${body} frame provides ${bodyDesc}, closing the distance in heartbeats. OORA never saw the ${tail} coming - ${tailDesc} seals its fate. Total hunt duration: ${time} seconds. ${punchline}`;
  
  return {
    imageUrl: `/images/${findBestMatch(head, body, tail)}`,
    animals: [head.toLowerCase(), body.toLowerCase(), tail.toLowerCase()],
    biome,
    narrative,
  };
}

// Custom Select Component
function Select({ 
  label, 
  value, 
  options, 
  onChange, 
  icon: Icon,
  error 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (v: string) => void;
  icon: React.ElementType;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <label className="block text-dark-200 text-sm font-medium mb-2 font-body flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary-500" />
        {label}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full bg-dark-600/60 backdrop-blur-sm border rounded-md px-4 py-3 text-left text-dark-50 font-body flex items-center justify-between hover:border-primary-500/40 transition-all duration-200 ${error ? 'border-red-500' : 'border-glass-border'}`}
      >
        <span className={value ? 'text-dark-50' : 'text-dark-400'}>{value || `Select ${label}`}</span>
        <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800/95 backdrop-blur-lg border border-glass-border rounded-md shadow-glass-card z-50 max-h-60 overflow-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full px-4 py-3 text-left hover:bg-primary-500/20 transition-colors ${value === opt ? 'bg-primary-500/30 text-primary-500' : 'text-dark-50'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [head, setHead] = useState('');
  const [body, setBody] = useState('');
  const [tail, setTail] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFact, setLoadingFact] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  
  const generatorRef = useRef<HTMLDivElement>(null);
  
  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Rotate facts during loading
  useEffect(() => {
    if (loading) {
      setLoadingFact(PREDATOR_FACTS[Math.floor(Math.random() * PREDATOR_FACTS.length)]);
      const interval = setInterval(() => {
        setLoadingFact(PREDATOR_FACTS[Math.floor(Math.random() * PREDATOR_FACTS.length)]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);
  
  const handleGenerate = () => {
    setError('');
    setShowError(false);
    
    if (!head || !body || !tail) {
      setError('Select all three components');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    const delay = 2000 + Math.random() * 1000; // 2-3s
    
    setTimeout(() => {
      const generated = generatePredator(head, body, tail);
      setResult(generated);
      setLoading(false);
    }, delay);
  };
  
  const canGenerate = head && body && tail;

  return (
    <div className="min-h-screen bg-dark-900 font-body">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Responsive hero */}
        <picture className="absolute inset-0">
          <source media="(max-width: 768px)" srcSet="/images/hero_canonical_mobile.png" />
          <source media="(min-width: 769px)" srcSet="/images/hero_canonical_desktop.png" />
          <img src="/images/hero_canonical_2048.png" alt="OORAKillers Hero" className="w-full h-full object-cover opacity-90" />
        </picture>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900/80 via-dark-900/60 to-primary-900/40" />
        
        {/* Glass Panel */}
        <div className="relative z-10 max-w-3xl mx-4 p-8 md:p-16 bg-glass-surface backdrop-blur-xl border border-glass-border rounded-xl shadow-glass-card text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-500 mb-4 tracking-tight" style={{ textShadow: '0 4px 24px rgba(220,38,38,0.5)' }}>
            OORAKILLERS
          </h1>
          <p className="text-dark-200 text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
            Forge the ultimate apex predator. Combine deadly traits. 
            Watch OORA meet its inevitable doom.
          </p>
          <button
            onClick={scrollToGenerator}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-md shadow-glass-sm hover:shadow-glass-card-hover hover:scale-105 transition-all duration-300"
          >
            <Skull className="w-5 h-5" />
            Generate Predator
          </button>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-dark-400" />
        </div>
      </section>
      
      {/* Generator Section */}
      <section ref={generatorRef} className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-dark-50 text-center mb-4">
            Build Your <span className="text-primary-500">Predator</span>
          </h2>
          <p className="text-dark-200 text-center mb-12 max-w-xl mx-auto">
            Select a head, body, and tail to create your custom apex predator.
          </p>
          
          {/* Selector Grid */}
          <div className="bg-glass-surface backdrop-blur-md border border-glass-border rounded-lg p-6 md:p-12 shadow-glass-card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Select label="HEAD" value={head} options={HEADS} onChange={setHead} icon={Target} error={showError && !head} />
              <Select label="BODY" value={body} options={BODIES} onChange={setBody} icon={Zap} error={showError && !body} />
              <Select label="TAIL" value={tail} options={TAILS} onChange={setTail} icon={Skull} error={showError && !tail} />
            </div>
            
            {/* Error Message */}
            {error && showError && (
              <div className="flex items-center justify-center gap-2 text-red-500 mb-6">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Preview Area */}
            <div className="relative aspect-video md:aspect-square max-w-md mx-auto bg-dark-800 rounded-lg border-2 border-primary-500/50 overflow-hidden mb-8">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-600 to-dark-800 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  <div className="relative z-10 text-center">
                    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-dark-200 text-sm italic max-w-xs">{loadingFact}</p>
                  </div>
                </div>
              ) : result ? (
                <img 
                  src={result.imageUrl}
                  alt="Generated Predator" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-dark-400">
                  <div className="text-center p-8">
                    <Skull className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Select all parts to generate your predator</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`inline-flex items-center gap-2 font-semibold px-10 py-4 rounded-md transition-all duration-300 ${
                  !loading
                    ? 'bg-primary-500 hover:bg-primary-700 text-white shadow-glass-sm hover:shadow-glass-card-hover hover:scale-105'
                    : 'bg-dark-600 text-dark-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Predator
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Narrative Panel */}
          {result && (
            <div className="bg-glass-surface backdrop-blur-md border border-glass-border rounded-lg p-8 shadow-glass-card animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-display text-xl md:text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <Skull className="w-6 h-6" />
                The Hunt Begins
              </h3>
              <p className="text-dark-200 text-lg leading-relaxed mb-6">
                {result.narrative}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-dark-400">
                <span className="px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full">
                  {result.animals.join(' + ')}
                </span>
                <span className="px-3 py-1 bg-dark-600 text-dark-200 rounded-full">
                  Biome: {result.biome}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-glass-border">
        <div className="max-w-4xl mx-auto text-center text-dark-400 text-sm">
          <p>OORAKILLERS - The Ultimate Predator Generator</p>
        </div>
      </footer>
    </div>
  );
}
