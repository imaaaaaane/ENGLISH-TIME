import React, { useState } from 'react';

interface Props {
  initialNames: string;
  onClose: () => void;
  onSave: (names: string) => void;
}

export default function ClassListModal({ initialNames, onClose, onSave }: Props) {
  const [studentNames, setStudentNames] = useState(initialNames);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-bg-card border border-slate-200 rounded-3xl shadow-2xl p-10 w-full max-w-[500px] flex flex-col gap-6">
        <h3 className="m-0 text-3xl font-semibold text-slate-900">👥 Class List</h3>
        <p className="m-0 text-text-muted">Enter student names below, one name per line.</p>

        <textarea
          value={studentNames}
          onChange={(e) => setStudentNames(e.target.value)}
          className="bg-bg-deep border border-slate-200 rounded-lg text-slate-900 p-4 focus:outline-none focus:border-primary transition-colors resize-y min-h-[200px] font-inherit"
          placeholder="e.g.\nAlice\nBob\nCharlie"
        />

        <div className="flex justify-between items-center mt-4">
          <button onClick={() => setStudentNames('')} className="px-6 py-3 rounded-xl font-bold cursor-pointer transition-all bg-transparent text-red-500 border border-red-500/30 hover:bg-red-500/10">
            🗑️ Clear All
          </button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold cursor-pointer transition-all bg-transparent border border-white/20 text-slate-900 hover:bg-white/5">Cancel</button>
            <button onClick={() => onSave(studentNames)} className="px-6 py-3 rounded-xl font-bold cursor-pointer transition-all bg-primary text-black border-none hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0">
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
