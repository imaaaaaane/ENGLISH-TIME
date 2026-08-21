import { useState } from 'react';
import {
  Image as ImageIcon, Dices, MicOff, Lightbulb,
  RefreshCw, Type, Hammer, Clock, ClipboardCheck,
  ChevronDown, ChevronRight, FolderOpen
} from 'lucide-react';
import logoImg from './assets/logo.png';

// Imports
import AttendanceTracker from './components/AttendanceTracker';
import VisualPrompts from './components/VisualPrompts';
import RolePlayRoulette from './components/RolePlayRoulette';
import TabooGenerator from './components/TabooGenerator';
import PitchPerfect from './components/PitchPerfect';
import ActionWheel from './components/ActionWheel';
import Hangman from './components/Hangman';
import SentenceBuilder from './components/SentenceBuilder';
import TimeBomb from './components/TimeBomb';
import AddPromptModal from './components/AddPromptModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('Attendance');
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);

  // States for Visual Prompts (Keeping your logic)
  const [levelFilter, setLevelFilter] = useState('A1');
  const [ageGroupFilter, setAgeGroupFilter] = useState('Kids');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const speakingActivities = [
    { name: 'Visual Prompts', icon: <ImageIcon size={20} strokeWidth={2.5} /> },
    { name: 'Role-Play Roulette', icon: <Dices size={20} strokeWidth={2.5} /> },
    { name: 'Taboo Generator', icon: <MicOff size={20} strokeWidth={2.5} /> },
    { name: 'Pitch Perfect', icon: <Lightbulb size={20} strokeWidth={2.5} /> },
    { name: 'Action Wheel', icon: <RefreshCw size={20} strokeWidth={2.5} /> },
    { name: 'Hangman', icon: <Type size={20} strokeWidth={2.5} /> },
    { name: 'Sentence Builder', icon: <Hammer size={20} strokeWidth={2.5} /> },
    { name: 'Time Bomb', icon: <Clock size={20} strokeWidth={2.5} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">

      {/* 1. LIGHT THEME SIDEBAR */}
      <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-50 shadow-sm">
        <div className="p-8 mb-2 flex flex-col items-center justify-center border-b border-slate-100">
          {/* Logo with inverted colors if needed, or keep original */}
          <img src={logoImg} alt="English Time" className="h-32 w-auto object-contain drop-shadow-sm" />
          <h2 className="font-black italic underline text-slate-800 text-center tracking-widest mt-3">
            TEACHERS DASHBOARD
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-2 custom-scrollbar">

          {/* ATTENDANCE BUTTON (Maintained at the top) */}
          <button
            onClick={() => setActiveTab('Attendance')}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'Attendance'
              ? 'bg-[#FFD100]/10 text-slate-900 border border-[#FFD100]/30 shadow-sm scale-[1.02]'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
          >
            <ClipboardCheck size={24} className={activeTab === 'Attendance' ? 'text-[#eab308]' : 'text-slate-400'} strokeWidth={2.5} />
            <span className="text-lg tracking-wide">Attendance</span>
          </button>

          {/* SPEAKING ACTIVITIES DROPDOWN */}
          <div className="mt-4 flex flex-col gap-1">
            <button
              onClick={() => setIsActivitiesOpen(!isActivitiesOpen)}
              className="flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent"
            >
              <div className="flex items-center gap-4">
                <FolderOpen size={24} className="text-[#FFD100]" strokeWidth={2.5} />
                <span className="text-lg tracking-wide">Activities</span>
              </div>
              {isActivitiesOpen ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
            </button>

            {/* EXPANDABLE LIST */}
            {isActivitiesOpen && (
              <div className="flex flex-col gap-1 pl-4 ml-6 border-l-2 border-slate-100 mt-2">
                {speakingActivities.map((item) => {
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${isActive
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200 scale-[1.02] -ml-[2px]'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                        }`}
                    >
                      <span className={isActive ? 'text-[#FFD100]' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="text-base tracking-wide">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 h-full w-full overflow-y-auto bg-[#f8fafc] p-8 md:p-14">

        {/* SINGLE WRAPPER FOR EVERYTHING: Toolbar, Component */}
        <div className="max-w-[1200px] mx-auto min-h-full flex flex-col gap-10">

          {/* TOOLBAR */}
          {activeTab !== 'Attendance' && (
            <div className="w-full flex justify-end items-center gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-xl px-5 py-2 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                ⚙️ Add Prompt
              </button>
              <select 
                className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-xl px-4 py-2 font-bold outline-none focus:border-[#FFD100] cursor-pointer"
                value={ageGroupFilter} 
                onChange={(e) => setAgeGroupFilter(e.target.value)}
              >
                <option value="Kids">Age Group: Kids</option>
                <option value="Teens">Age Group: Teens</option>
                <option value="Adults">Age Group: Adults</option>
              </select>
              <select 
                className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-xl px-4 py-2 font-bold outline-none focus:border-[#FFD100] cursor-pointer"
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="A1">Level: A1</option>
                <option value="A2">Level: A2</option>
                <option value="B1">Level: B1</option>
                <option value="B2">Level: B2</option>
                <option value="C1">Level: C1</option>
              </select>
            </div>
          )}


          {activeTab === 'Attendance' && <AttendanceTracker />}

          {activeTab === 'Visual Prompts' && (
            <VisualPrompts
              levelFilter={levelFilter}
              ageGroupFilter={ageGroupFilter}
              refreshTrigger={refreshTrigger}
            />
          )}
          {activeTab === 'Role-Play Roulette' && <RolePlayRoulette levelFilter={levelFilter} ageGroupFilter={ageGroupFilter} refreshTrigger={refreshTrigger} />}
          {activeTab === 'Taboo Generator' && <TabooGenerator levelFilter={levelFilter} ageGroupFilter={ageGroupFilter} refreshTrigger={refreshTrigger} />}
          {activeTab === 'Pitch Perfect' && <PitchPerfect levelFilter={levelFilter} ageGroupFilter={ageGroupFilter} refreshTrigger={refreshTrigger} />}
          {activeTab === 'Action Wheel' && <ActionWheel levelFilter={levelFilter} ageGroupFilter={ageGroupFilter} refreshTrigger={refreshTrigger} />}
          {activeTab === 'Hangman' && <Hangman levelFilter={levelFilter} ageGroupFilter={ageGroupFilter} refreshTrigger={refreshTrigger} />}
          {activeTab === 'Sentence Builder' && <SentenceBuilder levelFilter={levelFilter} ageGroupFilter={ageGroupFilter} refreshTrigger={refreshTrigger} />}
          {activeTab === 'Time Bomb' && <TimeBomb levelFilter={levelFilter} ageGroupFilter={ageGroupFilter} refreshTrigger={refreshTrigger} />}

          {isModalOpen && (
            <AddPromptModal 
              activeTab={activeTab} 
              onClose={() => setIsModalOpen(false)} 
              onSaved={() => setRefreshTrigger(prev => prev + 1)} 
            />
          )}
        </div>
      </main>

    </div>
  );
}