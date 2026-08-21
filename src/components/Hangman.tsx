import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Props { levelFilter: string; ageGroupFilter: string; refreshTrigger: number; }

export default function Hangman({ levelFilter, ageGroupFilter, refreshTrigger }: Props) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => { fetchData(); }, [levelFilter, ageGroupFilter, refreshTrigger]);

  const fetchData = async () => {
    let query = supabase.from('hangman_words').select('*');
    if (levelFilter !== 'All') query = query.eq('level', levelFilter);
    if (ageGroupFilter !== 'All') query = query.eq('age_group', ageGroupFilter);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      setPrompts(data);
      setCurrentIndex(0);
      setGuessedLetters([]);
      setMistakes(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    const { error } = await supabase.from('hangman_words').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (prompts.length === 0) {
    return <div className="text-3xl font-bold p-12 text-slate-400 text-center">0 PROMPTS FOUND</div>;
  }

  const p = prompts[currentIndex];
  const word = p.word || '';
  const isWinner = word && word.split('').every((char: string) => char === ' ' || guessedLetters.includes(char));
  const isLoser = mistakes >= 6;

  const handleGuess = (letter: string) => {
    if (isWinner || isLoser || guessedLetters.includes(letter)) return;
    setGuessedLetters([...guessedLetters, letter]);
    if (!word.includes(letter)) setMistakes(mistakes + 1);
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white border border-slate-200 shadow-sm w-full max-w-[900px] flex flex-col items-center relative overflow-hidden p-10 mx-auto rounded-3xl">
        <button
          onClick={() => handleDelete(p.id)}
          className="absolute top-4 right-4 bg-red-50 text-red-500 hover:bg-red-100 p-3 rounded-xl transition-colors z-10 cursor-pointer border-none"
        >
          <Trash2 size={24} />
        </button>

        <div className="flex justify-between w-full mb-8">
           <div className="text-2xl font-bold text-slate-500 bg-slate-50 px-6 py-2 rounded-xl border border-slate-200">
             Mistakes: <span className="text-rose-500">{mistakes}</span> / 6
           </div>
           {p.hint && (
             <div className="text-xl font-medium text-slate-600 bg-slate-100 px-6 py-2 rounded-xl border border-slate-200">
               Hint: {p.hint}
             </div>
           )}
        </div>

        <div className="flex gap-4 mb-12 flex-wrap justify-center">
          {word.split('').map((char: string, i: number) => (
            <div key={i} className="w-16 h-20 bg-slate-50 border border-slate-200 shadow-sm rounded-xl flex items-center justify-center text-4xl font-black text-slate-800">
              {char === ' ' ? '' : (guessedLetters.includes(char) || isLoser ? char : '_')}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center max-w-[700px] mb-8">
          {alphabet.map(letter => {
             const isGuessed = guessedLetters.includes(letter);
             const isCorrect = word.includes(letter);
             return (
               <button
                 key={letter}
                 disabled={isGuessed || isWinner || isLoser}
                 onClick={() => handleGuess(letter)}
                 className={`w-14 h-14 rounded-xl text-2xl font-bold shadow-sm transition-all border
                   ${isGuessed 
                     ? (isCorrect ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-400 border-slate-300')
                     : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:-translate-y-1'
                   } disabled:opacity-50`}
               >
                 {letter}
               </button>
             );
          })}
        </div>
        
        <div className="flex gap-4">
            <button
              className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full py-4 px-12 text-xl font-bold cursor-pointer shadow-sm hover:bg-slate-200 transition-all"
              onClick={() => { setGuessedLetters([]); setMistakes(0); }}
            >
              RETRY
            </button>
            <button
              className="bg-[#FFD100] text-black border-none rounded-full py-4 px-12 text-xl font-bold cursor-pointer shadow-md transition-all uppercase tracking-widest hover:-translate-y-1 hover:shadow-lg"
              onClick={() => { setCurrentIndex((currentIndex + 1) % prompts.length); setGuessedLetters([]); setMistakes(0); }}
            >
              NEXT WORD
            </button>
        </div>
      </div>
    </div>
  );
}
