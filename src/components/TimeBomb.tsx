import { useState, useEffect } from 'react';
import { Trash2, Bomb, Play, Pause, RotateCcw, Flame, SkipForward } from 'lucide-react';

export default function TimeBomb({
  id,
  promptText = "NAME 3 ANIMALS YOU CAN KEEP AS PETS AT HOME",
  timeLimit = 10,
  onDelete,
  onNext
}: any) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExploded, setHasExploded] = useState(false);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setIsRunning(false);
    setHasExploded(false);
  }, [promptText, timeLimit]);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev: number) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setHasExploded(true);
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    if (hasExploded) return;
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHasExploded(false);
    setTimeLeft(timeLimit);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">

      {/* L'Card L'kbira */}
      <div className="bg-[#18181b] border-2 border-gray-800 rounded-[3rem] p-12 w-full max-w-6xl shadow-2xl relative flex flex-col mx-auto">

        {/* L'Fou9: S-so2al w Trash */}
        <div className="flex justify-between items-start gap-8 mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-wide leading-tight uppercase flex-1">
            {promptText}
          </h2>
          <button
            onClick={() => onDelete?.(id)}
            className="text-gray-500 hover:text-red-500 p-4 bg-[#27272a] hover:bg-red-500/20 rounded-2xl transition-all shrink-0"
          >
            <Trash2 size={36} />
          </button>
        </div>

        {/* L'Wst: L'qenboula w L'weqt (Kbaaar bzaf) */}
        <div className="flex flex-col items-center justify-center min-h-[350px] w-full bg-[#09090b] rounded-[2.5rem] border-4 border-gray-800 mb-12 shadow-inner p-10">
          {hasExploded ? (
            <div className="flex flex-col items-center animate-bounce">
              <Flame size={140} className="text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
              <span className="text-8xl md:text-[9rem] font-black text-red-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">BOOM!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-12 md:gap-20 w-full">
              <Bomb
                size={160}
                className={`${isRunning ? 'text-yellow-400 animate-pulse drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]' : 'text-gray-600'} transition-all duration-300`}
              />
              <span className={`text-[10rem] md:text-[14rem] font-black tabular-nums transition-colors duration-300 leading-none ${timeLeft <= 5 ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]'}`}>
                {timeLeft}
              </span>
            </div>
          )}
        </div>

        {/* L-t7t: L'Boutonat L'3imlaqa */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-t-2 border-gray-800 pt-10">

          <button
            onClick={resetTimer}
            className="flex items-center gap-3 bg-[#27272a] hover:bg-gray-700 text-gray-300 px-8 py-5 rounded-2xl font-bold transition-all text-2xl shadow-md"
          >
            <RotateCcw size={32} /> Reset
          </button>

          <div className="flex gap-6 flex-wrap">
            <button
              onClick={toggleTimer}
              disabled={hasExploded}
              className={`flex items-center gap-4 px-12 py-5 rounded-2xl font-black transition-all text-3xl shadow-lg ${hasExploded
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : isRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-[0_0_30px_rgba(250,204,21,0.4)]'
                }`}
            >
              {isRunning ? <Pause size={36} /> : <Play size={36} className="ml-2" />}
              {isRunning ? "PAUSE" : "START"}
            </button>

            <button
              onClick={onNext}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black transition-all text-3xl shadow-[0_0_30px_rgba(37,99,235,0.5)]"
            >
              NEXT BOMB <SkipForward size={36} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}