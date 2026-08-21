import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Props { levelFilter: string; ageGroupFilter: string; refreshTrigger: number; }

export default function TimeBomb({ levelFilter, ageGroupFilter, refreshTrigger }: Props) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => { fetchData(); }, [levelFilter, ageGroupFilter, refreshTrigger]);

  const fetchData = async () => {
    let query = supabase.from('time_bomb').select('*');
    if (levelFilter !== 'All') query = query.eq('level', levelFilter);
    if (ageGroupFilter !== 'All') query = query.eq('age_group', ageGroupFilter);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      setPrompts(data);
      setCurrentIndex(0);
      if (data.length > 0) setTimeLeft(data[0].time_limit || 30);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    const { error } = await supabase.from('time_bomb').delete().eq('id', id);
    if (!error) fetchData();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Play explosion sound effect here if you want
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  if (prompts.length === 0) {
    return <div className="text-3xl font-bold p-12 text-slate-400 text-center">0 PROMPTS FOUND</div>;
  }

  const p = prompts[currentIndex];
  
  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % prompts.length;
    setCurrentIndex(nextIdx);
    setTimeLeft(prompts[nextIdx].time_limit || 30);
    setIsActive(false);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className={`bg-white border border-slate-200 shadow-sm w-full max-w-[800px] flex flex-col items-center relative overflow-hidden p-10 mx-auto rounded-3xl transition-colors duration-500 ${timeLeft === 0 && !isActive ? 'bg-rose-50 border-rose-300' : ''}`}>
        <button
          onClick={() => handleDelete(p.id)}
          className="absolute top-4 right-4 bg-red-50 text-red-500 hover:bg-red-100 p-3 rounded-xl transition-colors z-10 cursor-pointer border-none"
        >
          <Trash2 size={24} />
        </button>

        <div className="w-full text-center mb-8">
           <h2 className="text-5xl font-black text-slate-800 tracking-wide uppercase leading-tight">
             {p.prompt_text}
           </h2>
        </div>

        <div className={`text-[120px] font-black tabular-nums leading-none mb-10 transition-colors ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
           {timeLeft}s
        </div>
        
        <div className="flex gap-4">
            <button
              className={`border-none rounded-full py-4 px-12 text-2xl font-bold cursor-pointer shadow-md transition-all uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg ${isActive ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? 'PAUSE' : (timeLeft === 0 ? 'TIME UP!' : 'START TIMER')}
            </button>
            <button
              className="bg-[#FFD100] text-black border-none rounded-full py-4 px-12 text-2xl font-bold cursor-pointer shadow-md transition-all uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg"
              onClick={handleNext}
            >
              NEXT PROMPT
            </button>
        </div>
      </div>
    </div>
  );
}
