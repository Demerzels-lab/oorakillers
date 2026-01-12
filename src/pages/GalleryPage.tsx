import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trophy, ArrowLeft, Clock, Flame, Share2 } from 'lucide-react';
import { supabase, Predator } from '../lib/supabase';

const ITEMS_PER_PAGE = 12;

export default function GalleryPage() {
  const [predators, setPredators] = useState<Predator[]>([]);
  const [topPredators, setTopPredators] = useState<Predator[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Load liked IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('oorakillers_liked');
    if (stored) {
      setLikedIds(new Set(JSON.parse(stored)));
    }
  }, []);

  // Fetch predators
  useEffect(() => {
    fetchPredators();
  }, [sortBy, page]);

  // Fetch top 3 for leaderboard
  useEffect(() => {
    fetchTopPredators();
  }, []);

  async function fetchPredators() {
    setLoading(true);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('predators')
      .select('*', { count: 'exact' })
      .range(start, end);

    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('likes', { ascending: false });
    }

    const { data, count, error } = await query;
    if (!error && data) {
      setPredators(data);
      setTotal(count || 0);
    }
    setLoading(false);
  }

  async function fetchTopPredators() {
    const { data } = await supabase
      .from('predators')
      .select('*')
      .order('likes', { ascending: false })
      .limit(3);
    if (data) setTopPredators(data);
  }

  async function handleLike(predator: Predator) {
    if (likedIds.has(predator.id)) return;

    // Update local state immediately
    const newLikedIds = new Set(likedIds);
    newLikedIds.add(predator.id);
    setLikedIds(newLikedIds);
    localStorage.setItem('oorakillers_liked', JSON.stringify([...newLikedIds]));

    // Update UI
    setPredators(prev =>
      prev.map(p =>
        p.id === predator.id ? { ...p, likes: p.likes + 1 } : p
      )
    );
    setTopPredators(prev =>
      prev.map(p =>
        p.id === predator.id ? { ...p, likes: p.likes + 1 } : p
      )
    );

    // Update database
    await supabase
      .from('predators')
      .update({ likes: predator.likes + 1 })
      .eq('id', predator.id);

    // Insert vote record
    await supabase.from('votes').insert({
      predator_id: predator.id,
      voter_ip: 'anonymous',
    });
  }

  function shareToTwitter(predator: Predator) {
    const combo = `${predator.head}+${predator.body}+${predator.tail}`;
    const text = encodeURIComponent(
      `I discovered a ${combo} predator on OORAKillers! \ud83d\udd25 Check it out!`
    );
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-dark-900 font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-dark-200 hover:text-primary-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-display text-xl text-primary-500">OORAKILLERS</span>
          </Link>
          <h1 className="font-display text-2xl text-dark-50">Gallery</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Gallery */}
          <div className="flex-1">
            {/* Sort Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setSortBy('recent'); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  sortBy === 'recent'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-600 text-dark-200 hover:bg-dark-500'
                }`}
              >
                <Clock className="w-4 h-4" />
                Recent
              </button>
              <button
                onClick={() => { setSortBy('popular'); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  sortBy === 'popular'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-600 text-dark-200 hover:bg-dark-500'
                }`}
              >
                <Flame className="w-4 h-4" />
                Most Popular
              </button>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-dark-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : predators.length === 0 ? (
              <div className="text-center py-16 text-dark-400">
                <p>No predators yet. Be the first to create one!</p>
                <Link to="/" className="inline-block mt-4 text-primary-500 hover:underline">
                  Create Predator
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {predators.map(predator => (
                  <div
                    key={predator.id}
                    className="bg-glass-surface border border-glass-border rounded-lg overflow-hidden hover:border-primary-500/50 transition-all group"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={predator.image_url}
                        alt={`${predator.head}+${predator.body}+${predator.tail}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-dark-50 font-medium text-sm mb-1">
                        {predator.head} + {predator.body} + {predator.tail}
                      </p>
                      <p className="text-dark-400 text-xs mb-2">
                        by {predator.creator_name}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleLike(predator)}
                          disabled={likedIds.has(predator.id)}
                          className={`flex items-center gap-1 text-sm transition-all ${
                            likedIds.has(predator.id)
                              ? 'text-primary-500'
                              : 'text-dark-400 hover:text-primary-500'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${likedIds.has(predator.id) ? 'fill-primary-500' : ''}`}
                          />
                          {predator.likes}
                        </button>
                        <button
                          onClick={() => shareToTwitter(predator)}
                          className="text-dark-400 hover:text-primary-500 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-dark-600 text-dark-200 rounded-md disabled:opacity-50 hover:bg-dark-500 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-dark-200">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-dark-600 text-dark-200 rounded-md disabled:opacity-50 hover:bg-dark-500 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-glass-surface border border-glass-border rounded-lg p-4 sticky top-24">
              <h2 className="flex items-center gap-2 font-display text-lg text-primary-500 mb-4">
                <Trophy className="w-5 h-5" />
                Top Predators
              </h2>
              {topPredators.length === 0 ? (
                <p className="text-dark-400 text-sm">No predators yet</p>
              ) : (
                <div className="space-y-3">
                  {topPredators.map((predator, i) => (
                    <div
                      key={predator.id}
                      className="flex items-center gap-3 p-2 rounded-md bg-dark-700/50"
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0
                            ? 'bg-yellow-500 text-dark-900'
                            : i === 1
                            ? 'bg-gray-400 text-dark-900'
                            : 'bg-orange-700 text-dark-50'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-dark-50 text-sm truncate">
                          {predator.head}+{predator.body}+{predator.tail}
                        </p>
                        <p className="text-dark-400 text-xs">{predator.creator_name}</p>
                      </div>
                      <span className="flex items-center gap-1 text-primary-500 text-sm">
                        <Heart className="w-3 h-3 fill-primary-500" />
                        {predator.likes}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
