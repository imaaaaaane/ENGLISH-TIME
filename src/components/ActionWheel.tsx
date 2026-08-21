import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Props { levelFilter: string; ageGroupFilter: string; refreshTrigger: number; }

export default function ActionWheel({ levelFilter, ageGroupFilter, refreshTrigger }: Props) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => { fetchData(); }, [levelFilter, ageGroupFilter, refreshTrigger]);

  const fetchData = async () => {
    let query = supabase.from('action_prompts').select('*');
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
    const { error } = await supabase.from('action_prompts').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (prompts.length === 0) {
    return <div className="text-3xl font-bold p-12 text-slate-400 text-center">0 PROMPTS FOUND</div>;
  }

  const p = prompts[currentIndex];

  const handleSpin = () => {
    if (isSpinning || prompts.length <= 1) return;
    setIsSpinning(true);
    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * prompts.length);
      } while (nextIndex === currentIndex);
      setCurrentIndex(nextIndex);
      setIsSpinning(false);
    }, 2000); // 2 second spin
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white border border-slate-200 shadow-sm w-full max-w-[700px] flex flex-col items-center relative overflow-hidden p-10 mx-auto rounded-3xl">
        <button
          onClick={() => handleDelete(p.id)}
          className="absolute top-4 right-4 bg-red-50 text-red-500 hover:bg-red-100 p-3 rounded-xl transition-colors z-10 cursor-pointer border-none"
        >
          <Trash2 size={24} />
        </button>

        <div className={`w-[300px] h-[300px] rounded-full bg-slate-50 border-4 border-slate-200 shadow-inner flex items-center justify-center mb-8 relative transition-transform duration-[2000ms] ease-out ${isSpinning ? 'rotate-[1080deg] scale-95 opacity-80' : 'rotate-0'}`}>
           <div className="absolute -top-6 text-slate-800 text-6xl drop-shadow-md z-10">👇</div>
           <div className={`text-3xl font-black text-slate-800 text-center px-8 transition-opacity duration-300 ${isSpinning ? 'opacity-0' : 'opacity-100'}`}>
             {p.action_text}
           </div>
        </div>

        <button
          disabled={isSpinning}
          className="mt-4 bg-[#FFD100] text-black border-none rounded-full py-5 px-16 text-2xl font-bold cursor-pointer shadow-md transition-all uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSpin}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
        </button>
      </div>
    </div>
  );
}
