import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Props { levelFilter: string; ageGroupFilter: string; refreshTrigger: number; }

export default function PitchPerfect({ levelFilter, ageGroupFilter, refreshTrigger }: Props) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => { fetchData(); }, [levelFilter, ageGroupFilter, refreshTrigger]);

  const fetchData = async () => {
    let query = supabase.from('pitch_prompts').select('*');
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
    const { error } = await supabase.from('pitch_prompts').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (prompts.length === 0) {
    return <div className="text-3xl font-bold p-12 text-slate-400 text-center">0 PROMPTS FOUND</div>;
  }

  const p = prompts[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white border border-slate-200 shadow-sm w-full max-w-[800px] flex flex-col items-center relative overflow-hidden p-10 mx-auto rounded-3xl">
        <button
          onClick={() => handleDelete(p.id)}
          className="absolute top-4 right-4 bg-red-50 text-red-500 hover:bg-red-100 p-3 rounded-xl transition-colors z-10 cursor-pointer border-none"
        >
          <Trash2 size={24} />
        </button>

        <div className="bg-slate-50 w-full p-8 rounded-3xl border border-slate-200 shadow-inner text-center">
          <h2 className="text-xl text-purple-600 font-bold uppercase tracking-widest mb-4">Product Name</h2>
          <p className="text-5xl font-black m-0 text-slate-800 leading-relaxed break-words uppercase">
            {p.product_name}
          </p>
        </div>

        <div className="w-full mt-6 text-center">
          <h2 className="text-lg text-slate-400 font-bold uppercase tracking-widest mb-4">Description</h2>
          <p className="text-2xl font-medium text-slate-700 leading-relaxed">
            {p.description}
          </p>
        </div>

        <button
          className="mt-12 bg-[#FFD100] text-black border-none rounded-full py-5 px-16 text-2xl font-bold cursor-pointer shadow-md transition-all uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg"
          onClick={() => setCurrentIndex((currentIndex + 1) % prompts.length)}
        >
          NEXT PRODUCT
        </button>
      </div>
    </div>
  );
}
