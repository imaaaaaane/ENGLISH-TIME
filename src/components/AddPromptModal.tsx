import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  activeTab: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddPromptModal({ activeTab, onClose, onSaved }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [newPrompt, setNewPrompt] = useState<any>({
    level: 'A1', ageGroup: 'Kids',
    question: '', file: null,
    situation: '', role: '',
    targetWord: '', tabooWords: '', hint: '',
    productName: '', description: '',
    actionText: '', correctSentence: '', topic: '', promptText: '', timeLimit: 30,
    word: ''
  });

  const handleSavePrompt = async () => {
    setIsUploading(true);
    let imageUrl = '';
    
    if (activeTab === 'Visual Prompts' && newPrompt.file) {
      const fileExt = newPrompt.file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('visual_prompts_images').upload(fileName, newPrompt.file);
      if (uploadError) {
        alert('Image upload failed: ' + uploadError.message);
        setIsUploading(false);
        return;
      }
      const { data } = supabase.storage.from('visual_prompts_images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    let insertData: any = { level: newPrompt.level, age_group: newPrompt.ageGroup };
    let tableName = '';

    if (activeTab === 'Visual Prompts') {
      tableName = 'visual_prompts';
      insertData = { ...insertData, question: newPrompt.question, image_url: imageUrl };
    } else if (activeTab === 'Role-Play Roulette') {
      tableName = 'roleplay_prompts';
      insertData = { ...insertData, situation: newPrompt.situation, role: newPrompt.role };
    } else if (activeTab === 'Taboo Generator') {
      tableName = 'taboo_prompts';
      insertData = { ...insertData, target_word: newPrompt.targetWord, taboo_words: newPrompt.tabooWords.split(',').map((w: string)=>w.trim()) };
    } else if (activeTab === 'Pitch Perfect') {
      tableName = 'pitch_prompts';
      insertData = { ...insertData, product_name: newPrompt.productName, description: newPrompt.description };
    } else if (activeTab === 'Action Wheel') {
      tableName = 'action_prompts';
      insertData = { ...insertData, action_text: newPrompt.actionText };
    } else if (activeTab === 'Hangman') {
      tableName = 'hangman_words';
      insertData = { ...insertData, word: newPrompt.word.toUpperCase(), hint: newPrompt.hint };
    } else if (activeTab === 'Sentence Builder') {
      tableName = 'sentence_builder';
      // derive scrambled words from correct sentence
      const scrambled = newPrompt.correctSentence.split(' ').sort(() => Math.random() - 0.5);
      insertData = { ...insertData, topic: newPrompt.topic, correct_sentence: newPrompt.correctSentence, scrambled_words: scrambled };
    } else if (activeTab === 'Time Bomb') {
      tableName = 'time_bomb';
      insertData = { ...insertData, prompt_text: newPrompt.promptText, time_limit: newPrompt.timeLimit };
    }

    const { error } = await supabase.from(tableName).insert([insertData]);
    setIsUploading(false);
    
    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-3xl font-black text-slate-800 tracking-wide uppercase">ADD: {activeTab}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-xl transition-colors">&times;</button>
        </div>
        
        <div className="p-8 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-4">
            <select 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-[#FFD100]"
              value={newPrompt.level} 
              onChange={e => setNewPrompt({...newPrompt, level: e.target.value})}
            >
              <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option><option value="C1">C1</option>
            </select>
            <select 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-[#FFD100]"
              value={newPrompt.ageGroup} 
              onChange={e => setNewPrompt({...newPrompt, ageGroup: e.target.value})}
            >
              <option value="Kids">Kids</option><option value="Teens">Teens</option><option value="Adults">Adults</option>
            </select>
          </div>

          {activeTab === 'Visual Prompts' && (
            <>
              <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" onChange={e => setNewPrompt({...newPrompt, file: e.target.files?.[0]})} />
              <textarea placeholder="Questions (one per line)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 min-h-[100px]" value={newPrompt.question} onChange={e => setNewPrompt({...newPrompt, question: e.target.value})} />
            </>
          )}

          {activeTab === 'Role-Play Roulette' && (
            <>
              <input type="text" placeholder="Situation" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.situation} onChange={e => setNewPrompt({...newPrompt, situation: e.target.value})} />
              <input type="text" placeholder="Role" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.role} onChange={e => setNewPrompt({...newPrompt, role: e.target.value})} />
            </>
          )}

          {activeTab === 'Taboo Generator' && (
            <>
              <input type="text" placeholder="Target Word" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.targetWord} onChange={e => setNewPrompt({...newPrompt, targetWord: e.target.value})} />
              <input type="text" placeholder="Taboo Words (comma separated)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.tabooWords} onChange={e => setNewPrompt({...newPrompt, tabooWords: e.target.value})} />
            </>
          )}

          {activeTab === 'Pitch Perfect' && (
            <>
              <input type="text" placeholder="Product Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.productName} onChange={e => setNewPrompt({...newPrompt, productName: e.target.value})} />
              <textarea placeholder="Description" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 min-h-[100px]" value={newPrompt.description} onChange={e => setNewPrompt({...newPrompt, description: e.target.value})} />
            </>
          )}

          {activeTab === 'Action Wheel' && (
            <input type="text" placeholder="Action Text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.actionText} onChange={e => setNewPrompt({...newPrompt, actionText: e.target.value})} />
          )}

          {activeTab === 'Hangman' && (
            <>
              <input type="text" placeholder="Word" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 uppercase" value={newPrompt.word} onChange={e => setNewPrompt({...newPrompt, word: e.target.value})} />
              <input type="text" placeholder="Hint" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.hint} onChange={e => setNewPrompt({...newPrompt, hint: e.target.value})} />
            </>
          )}

          {activeTab === 'Sentence Builder' && (
            <>
              <input type="text" placeholder="Topic" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.topic} onChange={e => setNewPrompt({...newPrompt, topic: e.target.value})} />
              <input type="text" placeholder="Correct Sentence" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.correctSentence} onChange={e => setNewPrompt({...newPrompt, correctSentence: e.target.value})} />
            </>
          )}

          {activeTab === 'Time Bomb' && (
            <>
              <input type="text" placeholder="Prompt Text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.promptText} onChange={e => setNewPrompt({...newPrompt, promptText: e.target.value})} />
              <input type="number" placeholder="Time Limit (seconds)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700" value={newPrompt.timeLimit} onChange={e => setNewPrompt({...newPrompt, timeLimit: parseInt(e.target.value) || 30})} />
            </>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            disabled={isUploading}
            onClick={handleSavePrompt} 
            className="bg-[#FFD100] hover:bg-[#facc15] text-black text-black font-bold py-4 px-12 rounded-xl transition-colors shadow-sm disabled:opacity-50 tracking-widest uppercase"
          >
            {isUploading ? 'SAVING...' : 'SAVE PROMPT'}
          </button>
        </div>
      </div>
    </div>
  );
}
