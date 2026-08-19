import { useState, useEffect } from 'react';
import { Trash2, Check, X, ArrowRight } from 'lucide-react';

export default function SentenceBuilder({
  id,
  topic = "Build the Sentence:",
  scrambledWords = ["check", "I", "before", "my", "work", "emails"],
  correctSentence = "I check my emails before work",
  onDelete,
  onNext
}: any) {
  // Kan-reddo l'kelmat Objects (fihom ID) bash ila kant l'kelma m3awda (b7al "the") ma-y-w9e3sh mochkil
  const [availableWords, setAvailableWords] = useState<any[]>([]);
  const [selectedWords, setSelectedWords] = useState<any[]>([]);

  // Status dyal l-jawab: idle (baqi), checking, correct, incorrect
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  useEffect(() => {
    setAvailableWords(scrambledWords.map((word: string, i: number) => ({ id: `w-${i}`, word })));
    setSelectedWords([]);
    setStatus('idle');
  }, [scrambledWords]);

  const handleSelectWord = (wordObj: any) => {
    if (status !== 'idle') return; // Ila kan ki-chouf j-jawab ma-ymkench y-beddel
    setAvailableWords(availableWords.filter(w => w.id !== wordObj.id));
    setSelectedWords([...selectedWords, wordObj]);
  };

  const handleRemoveWord = (wordObj: any) => {
    if (status !== 'idle') return;
    setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
    setAvailableWords([...availableWords, wordObj]);
  };

  const checkAnswer = () => {
    const userSentence = selectedWords.map(w => w.word).join(" ").toLowerCase().trim();
    const correct = correctSentence.toLowerCase().trim();

    if (userSentence === correct) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
    }
  };

  const resetOrNext = () => {
    if (status === 'incorrect') {
      // Y-3awd y-jareb
      setAvailableWords(scrambledWords.map((word: string, i: number) => ({ id: `w-${i}`, word })));
      setSelectedWords([]);
      setStatus('idle');
    } else if (status === 'correct' && onNext) {
      // Y-doz l-so2al jdid
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full min-h-[85vh]">
      {/* Massive Container */}
      <div className="w-full max-w-6xl mx-auto bg-zinc-900 border-2 border-zinc-700 rounded-3xl p-10 flex flex-col gap-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">{topic}</h2>
          <button
            onClick={() => onDelete?.(id)}
            className="text-zinc-500 hover:text-red-500 transition-colors p-3 bg-zinc-800 hover:bg-red-500/20 rounded-full"
          >
            <Trash2 size={24} />
          </button>
        </div>

        {/* The Drop Zone (Duolingo style line) */}
        <div className="w-full min-h-[120px] border-b-4 border-zinc-600 flex flex-wrap gap-4 pb-4 items-start content-start">
          {selectedWords.map((wordObj) => (
            <button
              key={wordObj.id}
              onClick={() => handleRemoveWord(wordObj)}
              className="px-6 py-4 bg-yellow-400 text-black font-extrabold text-xl rounded-xl whitespace-nowrap shrink-0 flex-none h-auto w-auto shadow-md hover:bg-yellow-300 transition-transform hover:scale-105"
            >
              {wordObj.word}
            </button>
          ))}
        </div>

        {/* Available Words Area */}
        <div className="w-full flex flex-wrap gap-4 min-h-[120px] items-start content-start">
          {availableWords.map((wordObj) => (
            <button
              key={wordObj.id}
              onClick={() => handleSelectWord(wordObj)}
              className="px-6 py-4 bg-yellow-400 text-black font-extrabold text-xl rounded-xl whitespace-nowrap shrink-0 flex-none h-auto w-auto shadow-md hover:bg-yellow-300 transition-transform hover:scale-105"
            >
              {wordObj.word}
            </button>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className={`w-full flex justify-between items-center pt-6 border-t-2 ${status === 'correct' ? 'border-green-500' : status === 'incorrect' ? 'border-red-500' : 'border-zinc-800'}`}>
          
          <div className="flex items-center gap-4">
            {status === 'correct' && (
              <>
                <div className="bg-green-500 rounded-full p-2 text-black">
                  <Check size={28} strokeWidth={4} />
                </div>
                <h3 className="text-green-400 font-bold text-2xl">Excellent!</h3>
              </>
            )}
            {status === 'incorrect' && (
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-red-500 rounded-full p-2 text-white">
                    <X size={28} strokeWidth={4} />
                  </div>
                  <h3 className="text-red-400 font-bold text-2xl">Incorrect</h3>
                </div>
                <p className="text-red-300 text-lg font-medium">Correct answer: <span className="font-bold">{correctSentence}</span></p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            {status === 'idle' ? (
              <button
                onClick={checkAnswer}
                disabled={selectedWords.length === 0}
                className={`px-10 py-4 rounded-xl font-extrabold text-2xl uppercase transition-transform ${selectedWords.length > 0
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
              >
                Check
              </button>
            ) : (
              <button
                onClick={resetOrNext}
                className={`px-10 py-4 rounded-xl font-extrabold text-2xl uppercase transition-transform hover:scale-105 flex items-center gap-3 ${status === 'correct'
                    ? 'bg-green-500 text-black hover:bg-green-400'
                    : 'bg-red-500 text-white hover:bg-red-400'
                  }`}
              >
                {status === 'correct' ? (
                  <>Continue <ArrowRight size={28} strokeWidth={3} /></>
                ) : (
                  'Got it'
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}