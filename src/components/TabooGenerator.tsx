import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Props { levelFilter: string; ageGroupFilter: string; refreshTrigger: number; }

export default function TabooGenerator({ levelFilter, ageGroupFilter, refreshTrigger }: Props) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => { fetchData(); }, [levelFilter, ageGroupFilter, refreshTrigger]);

  const fetchData = async () => {
    let query = supabase.from('taboo_prompts').select('*');
    if (levelFilter !== 'All') query = query.eq('level', levelFilter);
    if (ageGroupFilter !== 'All') query = query.eq('age_group', ageGroupFilter);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      setPrompts(data);
      setCurrentIndex(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    const { error } = await supabase.from('taboo_prompts').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (prompts.length === 0) {
    return <div className="text-3xl font-bold p-12 text-slate-400 text-center">0 PROMPTS FOUND</div>;
  }

  const getTabooWords = (words: any) => {
    if (!words) return [];
    if (Array.isArray(words)) return words;
    if (typeof words === 'string') {
      try {
        const parsed = JSON.parse(words);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return words.split(',').map(w => w.trim());
    }
    return [];
  };

  const p = prompts[currentIndex];
  const parsedTabooWords = getTabooWords(p.taboo_words);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white border border-slate-200 shadow-sm w-full max-w-[600px] flex flex-col items-center relative overflow-hidden p-10 mx-auto rounded-3xl">
        <button
          onClick={() => handleDelete(p.id)}
          className="absolute top-4 right-4 bg-red-50 text-red-500 hover:bg-red-100 p-3 rounded-xl transition-colors z-10 cursor-pointer border-none"
        >
          <Trash2 size={24} />
        </button>

        <div className="bg-slate-900 w-full p-8 rounded-t-3xl text-center border-b-[8px] border-slate-950">
          <h2 className="text-xl text-white/80 font-bold uppercase tracking-widest mb-2">Target Word</h2>
          <p className="text-5xl font-black m-0 text-white tracking-wider uppercase">
            {p.target_word}
          </p>
        </div>

        <div className="bg-slate-50 w-full p-8 rounded-b-3xl border border-slate-200 shadow-inner flex flex-col items-center gap-4">
          <h2 className="text-lg text-rose-500 font-bold uppercase tracking-widest mb-2">Taboo Words (Do Not Say)</h2>
          {parsedTabooWords.map((word: string, i: number) => (
            <div key={i} className="text-2xl font-bold text-slate-700 bg-white border border-slate-200 shadow-sm w-full text-center py-3 rounded-xl">
              {word}
            </div>
          ))}
        </div>

        <button
          className="mt-12 bg-[#FFD100] text-black border-none rounded-full py-5 px-16 text-2xl font-bold cursor-pointer shadow-md transition-all uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg"
          onClick={() => setCurrentIndex((currentIndex + 1) % prompts.length)}
        >
          NEXT CARD
        </button>
      </div>
    </div>
  );
}
