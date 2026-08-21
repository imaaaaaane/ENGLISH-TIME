import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Props { levelFilter: string; ageGroupFilter: string; refreshTrigger: number; }

export default function SentenceBuilder({ levelFilter, ageGroupFilter, refreshTrigger }: Props) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState<string[]>([]);

  useEffect(() => { fetchData(); }, [levelFilter, ageGroupFilter, refreshTrigger]);

  const fetchData = async () => {
    let query = supabase.from('sentence_builder').select('*');
    if (levelFilter !== 'All') query = query.eq('level', levelFilter);
    if (ageGroupFilter !== 'All') query = query.eq('age_group', ageGroupFilter);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      setPrompts(data);
      setCurrentIndex(0);
      setUserSentence([]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    const { error } = await supabase.from('sentence_builder').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (prompts.length === 0) {
    return <div className="text-3xl font-bold p-12 text-slate-400 text-center">0 PROMPTS FOUND</div>;
  }

  const p = prompts[currentIndex];
  const availableWords = (p.scrambled_words || []).filter((w: string) => !userSentence.includes(w));
  const isComplete = userSentence.length === (p.scrambled_words || []).length;
  const isCorrect = userSentence.join(' ') === p.correct_sentence;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white border border-slate-200 shadow-sm w-full max-w-[1000px] flex flex-col items-center relative overflow-hidden p-10 mx-auto rounded-3xl">
        <button
          onClick={() => handleDelete(p.id)}
          className="absolute top-4 right-4 bg-red-50 text-red-500 hover:bg-red-100 p-3 rounded-xl transition-colors z-10 cursor-pointer border-none"
        >
          <Trash2 size={24} />
        </button>

        <h2 className="text-xl text-slate-900 font-bold uppercase tracking-widest mb-8">Topic: {p.topic}</h2>

        <div className="w-full min-h-[150px] bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 flex flex-wrap gap-4 items-start shadow-inner">
           {userSentence.length === 0 && <span className="text-slate-400 text-xl font-bold italic">Click words to build your sentence...</span>}
           {userSentence.map((word, i) => (
             <button 
               key={i} 
               onClick={() => setUserSentence(userSentence.filter((_, index) => index !== i))}
               className="bg-white border border-slate-200 text-slate-800 text-2xl font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-slate-50 hover:text-red-500 transition-colors"
             >
               {word}
             </button>
           ))}
        </div>

        <div className="w-full flex flex-wrap justify-center gap-4 mb-10">
           {availableWords.map((word: string, i: number) => (
             <button 
               key={i} 
               onClick={() => setUserSentence([...userSentence, word])}
               className="bg-slate-100 border border-slate-300 text-slate-800 text-2xl font-bold py-3 px-6 rounded-xl shadow-sm hover:-translate-y-1 transition-all"
             >
               {word}
             </button>
           ))}
        </div>
        
        {isComplete && (
           <div className={`text-3xl font-black mb-8 py-4 px-10 rounded-2xl ${isCorrect ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
             {isCorrect ? '🎉 PERFECT!' : '❌ TRY AGAIN!'}
           </div>
        )}

        <div className="flex gap-4">
            <button
              className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full py-4 px-12 text-xl font-bold cursor-pointer shadow-sm hover:bg-slate-200 transition-all"
              onClick={() => setUserSentence([])}
            >
              RESET
            </button>
            <button
              className="bg-[#FFD100] text-black border-none rounded-full py-4 px-12 text-xl font-bold cursor-pointer shadow-md transition-all uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg"
              onClick={() => { setCurrentIndex((currentIndex + 1) % prompts.length); setUserSentence([]); }}
            >
              NEXT PUZZLE
            </button>
        </div>
      </div>
    </div>
  );
}
