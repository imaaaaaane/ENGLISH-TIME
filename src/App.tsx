import React, { useState, useEffect } from 'react';
import { Image, Dices, MicOff, Lightbulb, RefreshCw, ListOrdered, Bomb } from 'lucide-react';
import { supabase } from './lib/supabase';
import logoImg from './assets/logo.png';
import SentenceBuilder from './components/SentenceBuilder';
import TimeBomb from './components/TimeBomb';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('Role-Play Roulette');
  const [logoError, setLogoError] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // New States for Supabase Integration
  const [prompts, setPrompts] = useState<any[]>([]);
  const [levelFilter, setLevelFilter] = useState('B1');
  const [ageGroupFilter, setAgeGroupFilter] = useState('Adults');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newPrompt, setNewPrompt] = useState<{ file: File | null, question: string, situation: string, role: string, targetWord: string, tabooWords: string, productName: string, description: string, actionText: string, level: string, ageGroup: string, hint: string, topic: string, correctSentence: string, promptText: string, timeLimit: number }>({ file: null, question: '', situation: '', role: '', targetWord: '', tabooWords: '', productName: '', description: '', actionText: '', level: 'B1', ageGroup: 'Adults', hint: '', topic: '', correctSentence: '', promptText: '', timeLimit: 15 });
  const [roleplayPrompts, setRoleplayPrompts] = useState<any[]>([]);
  const [currentRoleplayIndex, setCurrentRoleplayIndex] = useState(0);
  const [tabooPrompts, setTabooPrompts] = useState<any[]>([]);
  const [currentTabooIndex, setCurrentTabooIndex] = useState(0);
  const [pitchPrompts, setPitchPrompts] = useState<any[]>([]);
  const [currentPitchIndex, setCurrentPitchIndex] = useState(0);
  const [actionPrompts, setActionPrompts] = useState<any[]>([]);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const [hangmanPrompts, setHangmanPrompts] = useState<any[]>([]);
  const [currentHangmanIndex, setCurrentHangmanIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [letterHintsUsed, setLetterHintsUsed] = useState(0);
  const [sentenceBuilderPrompts, setSentenceBuilderPrompts] = useState<any[]>([]);
  const [currentSentenceBuilderIndex, setCurrentSentenceBuilderIndex] = useState(0);
  const [timeBombPrompts, setTimeBombPrompts] = useState<any[]>([]);
  const [currentTimeBombIndex, setCurrentTimeBombIndex] = useState(0);

  const [isClassListModalOpen, setIsClassListModalOpen] = useState(false);
  const [studentNames, setStudentNames] = useState('');
  const [pickedStudent, setPickedStudent] = useState('');

  const handleNextPrompt = () => {
    if (prompts.length > 0) {
      setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
    }
  };

  const handleSpin = () => {
    if (roleplayPrompts.length > 1) {
      let randomIndex = currentRoleplayIndex;
      while (randomIndex === currentRoleplayIndex) {
        randomIndex = Math.floor(Math.random() * roleplayPrompts.length);
      }
      setCurrentRoleplayIndex(randomIndex);
    } else if (roleplayPrompts.length === 1) {
      setCurrentRoleplayIndex(0);
    }
  };

  const handleNextTaboo = () => {
    if (tabooPrompts.length > 1) {
      let randomIndex = currentTabooIndex;
      while (randomIndex === currentTabooIndex) {
        randomIndex = Math.floor(Math.random() * tabooPrompts.length);
      }
      setCurrentTabooIndex(randomIndex);
    } else if (tabooPrompts.length === 1) {
      setCurrentTabooIndex(0);
    }
  };

  const handleNextPitch = () => {
    if (pitchPrompts.length > 1) {
      let randomIndex = currentPitchIndex;
      while (randomIndex === currentPitchIndex) {
        randomIndex = Math.floor(Math.random() * pitchPrompts.length);
      }
      setCurrentPitchIndex(randomIndex);
    } else if (pitchPrompts.length === 1) {
      setCurrentPitchIndex(0);
    }
  };

  const handleSpinAction = () => {
    if (isWheelSpinning || actionPrompts.length === 0) return;
    
    const newRotation = wheelRotation + 360 * 5 + Math.floor(Math.random() * 360);
    setWheelRotation(newRotation);
    setIsWheelSpinning(true);

    if (actionPrompts.length > 1) {
      let randomIndex = currentActionIndex;
      while (randomIndex === currentActionIndex) {
        randomIndex = Math.floor(Math.random() * actionPrompts.length);
      }
      setCurrentActionIndex(randomIndex);
    } else if (actionPrompts.length === 1) {
      setCurrentActionIndex(0);
    }

    setTimeout(() => {
      setIsWheelSpinning(false);
    }, 3000);
  };

  const handlePickStudent = () => {
    if (!studentNames.trim()) return;
    const names = studentNames.split('\n').map(name => name.trim()).filter(name => name);
    if (names.length > 0) {
      const randomIndex = Math.floor(Math.random() * names.length);
      setPickedStudent(names[randomIndex]);
    }
  };

  const handleNextHangman = () => {
    setMistakes(0);
    setShowHint(false);
    setLetterHintsUsed(0);
    if (hangmanPrompts.length > 1) {
      let randomIndex = currentHangmanIndex;
      while (randomIndex === currentHangmanIndex) {
        randomIndex = Math.floor(Math.random() * hangmanPrompts.length);
      }
      setCurrentHangmanIndex(randomIndex);
      const nextWord = hangmanPrompts[randomIndex]?.word?.toUpperCase() || '';
      if (nextWord) {
        setGuessedLetters(Array.from<string>(new Set([nextWord[0], nextWord[Math.floor(nextWord.length / 2)]].filter(c => c !== ' '))));
      } else {
        setGuessedLetters([]);
      }
    } else if (hangmanPrompts.length === 1) {
      setCurrentHangmanIndex(0);
      const nextWord = hangmanPrompts[0]?.word?.toUpperCase() || '';
      if (nextWord) {
        setGuessedLetters(Array.from<string>(new Set([nextWord[0], nextWord[Math.floor(nextWord.length / 2)]].filter(c => c !== ' '))));
      } else {
        setGuessedLetters([]);
      }
    } else {
      setGuessedLetters([]);
    }
  };

  const handleNextSentenceBuilder = () => {
    if (sentenceBuilderPrompts.length > 0) {
      setCurrentSentenceBuilderIndex((prev) => (prev + 1) % sentenceBuilderPrompts.length);
    }
  };

  const handleNextTimeBomb = () => {
    if (timeBombPrompts.length > 0) {
      setCurrentTimeBombIndex((prev) => (prev + 1) % timeBombPrompts.length);
    }
  };

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || mistakes >= 6) return;
    
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);
    
    const word = hangmanPrompts[currentHangmanIndex]?.word?.toUpperCase() || '';
    if (!word.includes(letter)) {
      setMistakes(m => m + 1);
    }
  };

  const handleRevealLetter = () => {
    if (letterHintsUsed >= 2 || mistakes >= 6) return;
    
    const word = hangmanPrompts[currentHangmanIndex]?.word?.toUpperCase() || '';
    const unrevealedLetters = Array.from<string>(new Set(word.split('').filter((char: string) => char !== ' ' && !guessedLetters.includes(char))));
    
    if (unrevealedLetters.length > 0) {
      const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)] as string;
      setGuessedLetters([...guessedLetters, randomLetter]);
      setLetterHintsUsed(prev => prev + 1);
    }
  };

  const handleGiveUp = () => {
    if (mistakes >= 6) return;
    const word = hangmanPrompts[currentHangmanIndex]?.word?.toUpperCase() || '';
    const uniqueLetters = Array.from<string>(new Set(word.split('').filter((char: string) => char !== ' ')));
    setGuessedLetters(Array.from(new Set([...guessedLetters, ...uniqueLetters])));
    setMistakes(6);
  };

  const fetchPrompts = async () => {
    console.log('Fetching level:', levelFilter, 'ageGroup:', ageGroupFilter, 'for tab:', activeTab);
    try {
      if (activeTab === 'Visual Prompts') {
        const { data, error } = await supabase.from('visual_prompts')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error:', error);
        } else {
          setPrompts(data || []);
          setCurrentPromptIndex(0);
        }
      } else if (activeTab === 'Role-Play Roulette') {
        const { data, error } = await supabase.from('roleplay_prompts')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error (Role-Play):', error);
        } else {
          setRoleplayPrompts(data || []);
          if (data && data.length > 0) {
            setCurrentRoleplayIndex(Math.floor(Math.random() * data.length));
          } else {
            setCurrentRoleplayIndex(0);
          }
        }
      } else if (activeTab === 'Taboo Generator') {
        const { data, error } = await supabase.from('taboo_prompts')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error (Taboo):', error);
        } else {
          setTabooPrompts(data || []);
          if (data && data.length > 0) {
            setCurrentTabooIndex(Math.floor(Math.random() * data.length));
          } else {
            setCurrentTabooIndex(0);
          }
        }
      } else if (activeTab === 'Pitch Perfect') {
        const { data, error } = await supabase.from('pitch_prompts')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error (Pitch):', error);
        } else {
          setPitchPrompts(data || []);
          if (data && data.length > 0) {
            setCurrentPitchIndex(Math.floor(Math.random() * data.length));
          } else {
            setCurrentPitchIndex(0);
          }
        }
      } else if (activeTab === 'Action Wheel') {
        const { data, error } = await supabase.from('action_prompts')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error (Action):', error);
        } else {
          setActionPrompts(data || []);
          if (data && data.length > 0) {
            setCurrentActionIndex(Math.floor(Math.random() * data.length));
          } else {
            setCurrentActionIndex(0);
          }
        }
      } else if (activeTab === 'Hangman') {
        const { data, error } = await supabase.from('hangman_words')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error (Hangman):', error);
        } else {
          setHangmanPrompts(data || []);
          setMistakes(0);
          setShowHint(false);
          setLetterHintsUsed(0);
          if (data && data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.length);
            setCurrentHangmanIndex(randomIndex);
            const nextWord = data[randomIndex]?.word?.toUpperCase() || '';
            if (nextWord) {
              setGuessedLetters(Array.from<string>(new Set([nextWord[0], nextWord[Math.floor(nextWord.length / 2)]].filter(c => c !== ' '))));
            } else {
              setGuessedLetters([]);
            }
          } else {
            setCurrentHangmanIndex(0);
            setGuessedLetters([]);
          }
        }
      } else if (activeTab === 'Sentence Builder') {
        const { data, error } = await supabase.from('sentence_builder')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error (Sentence Builder):', error);
        } else {
          setSentenceBuilderPrompts(data || []);
          if (data && data.length > 0) {
            setCurrentSentenceBuilderIndex(Math.floor(Math.random() * data.length));
          } else {
            setCurrentSentenceBuilderIndex(0);
          }
        }
      } else if (activeTab === 'Time Bomb') {
        const { data, error } = await supabase.from('time_bomb')
          .select('*')
          .eq('level', levelFilter)
          .eq('age_group', ageGroupFilter);
        if (error) {
          console.error('Supabase fetch error (Time Bomb):', error);
        } else {
          setTimeBombPrompts(data || []);
          if (data && data.length > 0) {
            setCurrentTimeBombIndex(Math.floor(Math.random() * data.length));
          } else {
            setCurrentTimeBombIndex(0);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error during Supabase fetch:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'Visual Prompts' || activeTab === 'Role-Play Roulette' || activeTab === 'Taboo Generator' || activeTab === 'Pitch Perfect' || activeTab === 'Action Wheel' || activeTab === 'Hangman' || activeTab === 'Sentence Builder' || activeTab === 'Time Bomb') {
      fetchPrompts();
    }
  }, [activeTab, levelFilter, ageGroupFilter]);

  const handleSavePrompt = async () => {
    setIsUploading(true);
    try {
      if (activeTab === 'Visual Prompts') {
        if (!newPrompt.file) {
          alert("Please select an image file first.");
          setIsUploading(false);
          return;
        }
        
        const fileExt = newPrompt.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('prompts_images').upload(fileName, newPrompt.file);
        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          setIsUploading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage.from('prompts_images').getPublicUrl(fileName);

        const { error } = await supabase.from('visual_prompts').insert([{
          image_url: publicUrl,
          question: newPrompt.question,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error:", error);
          setIsUploading(false);
          return;
        }
      } else if (activeTab === 'Role-Play Roulette') {
        const { error } = await supabase.from('roleplay_prompts').insert([{
          situation: newPrompt.situation,
          role: newPrompt.role,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error (Role-Play):", error);
          setIsUploading(false);
          return;
        }
      } else if (activeTab === 'Taboo Generator') {
        const { error } = await supabase.from('taboo_prompts').insert([{
          target_word: newPrompt.targetWord,
          taboo_words: newPrompt.tabooWords,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error (Taboo):", error);
          setIsUploading(false);
          return;
        }
      } else if (activeTab === 'Pitch Perfect') {
        const { error } = await supabase.from('pitch_prompts').insert([{
          product_name: newPrompt.productName,
          description: newPrompt.description,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error (Pitch):", error);
          setIsUploading(false);
          return;
        }
      } else if (activeTab === 'Action Wheel') {
        const { error } = await supabase.from('action_prompts').insert([{
          action_text: newPrompt.actionText,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error (Action):", error);
          setIsUploading(false);
          return;
        }
      } else if (activeTab === 'Hangman') {
        if (!newPrompt.targetWord.trim()) {
          alert('Please enter a target word.');
          setIsUploading(false);
          return;
        }

        const { error } = await supabase.from('hangman_words').insert([{
          word: newPrompt.targetWord.trim().toUpperCase(),
          hint: newPrompt.hint.trim() || null,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error (Hangman):", error);
          alert('Failed to save the prompt. Please try again.');
          setIsUploading(false);
          return;
        }
      } else if (activeTab === 'Sentence Builder') {
        if (!newPrompt.correctSentence.trim()) {
          alert('Please enter a correct sentence.');
          setIsUploading(false);
          return;
        }

        const words = newPrompt.correctSentence.trim().split(/\s+/);
        // Fisher-Yates shuffle
        const scrambledWords = [...words];
        for (let i = scrambledWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [scrambledWords[i], scrambledWords[j]] = [scrambledWords[j], scrambledWords[i]];
        }

        const { error } = await supabase.from('sentence_builder').insert([{
          topic: newPrompt.topic.trim(),
          correct_sentence: newPrompt.correctSentence.trim(),
          scrambled_words: scrambledWords,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error (Sentence Builder):", error);
          alert('Failed to save the prompt. Please try again.');
          setIsUploading(false);
          return;
        }
      } else if (activeTab === 'Time Bomb') {
        if (!newPrompt.promptText.trim()) {
          alert('Please enter a prompt text.');
          setIsUploading(false);
          return;
        }

        const { error } = await supabase.from('time_bomb').insert([{
          topic: newPrompt.topic.trim() || null,
          prompt_text: newPrompt.promptText.trim(),
          time_limit: newPrompt.timeLimit || 15,
          level: newPrompt.level,
          age_group: newPrompt.ageGroup
        }]);
        
        if (error) {
          console.error("Supabase insert error (Time Bomb):", error);
          alert('Failed to save the prompt. Please try again.');
          setIsUploading(false);
          return;
        }
      }
      
      setIsModalOpen(false);
      setNewPrompt({ file: null, question: '', situation: '', role: '', targetWord: '', tabooWords: '', productName: '', description: '', actionText: '', level: 'B1', ageGroup: 'Adults', hint: '', topic: '', correctSentence: '', promptText: '', timeLimit: 15 });
      fetchPrompts();
    } catch (err) {
      console.error("Unexpected error saving prompt:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number, table: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error("Supabase delete error:", error);
        return;
      }
      
      if (table === 'visual_prompts') {
        const newPrompts = prompts.filter(p => p.id !== id);
        setPrompts(newPrompts);
        
        if (newPrompts.length === 0) {
          setCurrentPromptIndex(0);
        } else if (currentPromptIndex >= newPrompts.length) {
          setCurrentPromptIndex(newPrompts.length - 1);
        }
      } else if (table === 'roleplay_prompts') {
        const newRoleplays = roleplayPrompts.filter(p => p.id !== id);
        setRoleplayPrompts(newRoleplays);
        
        if (newRoleplays.length === 0) {
          setCurrentRoleplayIndex(0);
        } else {
          if (currentRoleplayIndex >= newRoleplays.length) {
            setCurrentRoleplayIndex(Math.floor(Math.random() * newRoleplays.length));
          }
        }
      } else if (table === 'taboo_prompts') {
        const newTaboos = tabooPrompts.filter(p => p.id !== id);
        setTabooPrompts(newTaboos);
        
        if (newTaboos.length === 0) {
          setCurrentTabooIndex(0);
        } else {
          if (currentTabooIndex >= newTaboos.length) {
            setCurrentTabooIndex(Math.floor(Math.random() * newTaboos.length));
          }
        }
      } else if (table === 'pitch_prompts') {
        const newPitches = pitchPrompts.filter(p => p.id !== id);
        setPitchPrompts(newPitches);
        
        if (newPitches.length === 0) {
          setCurrentPitchIndex(0);
        } else {
          if (currentPitchIndex >= newPitches.length) {
            setCurrentPitchIndex(Math.floor(Math.random() * newPitches.length));
          }
        }
      } else if (table === 'action_prompts') {
        const newActions = actionPrompts.filter(p => p.id !== id);
        setActionPrompts(newActions);
        
        if (newActions.length === 0) {
          setCurrentActionIndex(0);
        } else {
          if (currentActionIndex >= newActions.length) {
            setCurrentActionIndex(Math.floor(Math.random() * newActions.length));
          }
        }
      } else if (table === 'sentence_builder') {
        const newSentenceBuilders = sentenceBuilderPrompts.filter(p => p.id !== id);
        setSentenceBuilderPrompts(newSentenceBuilders);
        
        if (newSentenceBuilders.length === 0) {
          setCurrentSentenceBuilderIndex(0);
        } else {
          if (currentSentenceBuilderIndex >= newSentenceBuilders.length) {
            setCurrentSentenceBuilderIndex(Math.floor(Math.random() * newSentenceBuilders.length));
          }
        }
      } else if (table === 'time_bomb') {
        const newTimeBombs = timeBombPrompts.filter(p => p.id !== id);
        setTimeBombPrompts(newTimeBombs);
        
        if (newTimeBombs.length === 0) {
          setCurrentTimeBombIndex(0);
        } else {
          if (currentTimeBombIndex >= newTimeBombs.length) {
            setCurrentTimeBombIndex(Math.floor(Math.random() * newTimeBombs.length));
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error deleting prompt:", err);
    }
  };

  const navItems = [
    { name: 'Visual Prompts', icon: <Image size={24} strokeWidth={2.5} color="#3B82F6" />, color: '#3B82F6' },
    { name: 'Role-Play Roulette', icon: <Dices size={24} strokeWidth={2.5} color="#FFD100" />, color: '#FFD100' },
    { name: 'Taboo Generator', icon: <MicOff size={24} strokeWidth={2.5} color="#EF4444" />, color: '#EF4444' },
    { name: 'Pitch Perfect', icon: <Lightbulb size={24} strokeWidth={2.5} color="#10B981" />, color: '#10B981' },
    { name: 'Action Wheel', icon: <RefreshCw size={24} strokeWidth={2.5} color="#8B5CF6" />, color: '#8B5CF6' },
    { name: 'Hangman', icon: <span style={{fontSize: '24px', lineHeight: 1}}>🔤</span>, color: '#EC4899' },
    { name: 'Sentence Builder', icon: <ListOrdered size={24} strokeWidth={2.5} color="#F97316" />, color: '#F97316' },
    { name: 'Time Bomb', icon: <Bomb size={24} strokeWidth={2.5} color="#EF4444" />, color: '#EF4444' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* LEFT SIDEBAR */}
      <aside style={{
        width: '300px',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '2.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.2)', // Slightly darker sidebar for contrast against the gradient
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ padding: '0 2rem', marginBottom: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!logoError ? (
            <img 
              src={logoImg} 
              alt="English Time Logo" 
              style={{ width: '100%', maxWidth: '200px', height: 'auto', objectFit: 'contain' }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
              English<span style={{ color: '#FFD100' }}>Time</span>
            </h1>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.name;
            // Add alpha to hex color for background (approx 10% opacity)
            const bgColor = isActive ? `${item.color}1A` : 'transparent';
            
            return (
              <div 
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                style={{
                  padding: '1.25rem 2rem',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: isActive ? item.color : 'var(--color-text)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  backgroundColor: bgColor,
                  borderLeft: `4px solid ${isActive ? item.color : 'transparent'}`,
                  borderTopRightRadius: '20px',
                  borderBottomRightRadius: '20px',
                  marginRight: '1rem',
                  boxShadow: isActive ? `inset 0 0 20px ${item.color}11` : 'none',
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  filter: isActive ? `drop-shadow(0 0 8px ${item.color}66)` : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {item.icon}
                </div>
                <span style={{
                  textShadow: isActive ? `0 0 10px ${item.color}44` : 'none',
                }}>{item.name}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '2rem 3rem',
        }}>
          {/* Empty left section to balance grid */}
          <div></div>
          
          {/* Center Title */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              Speaking Activities
            </h2>
          </div>

          {/* Right Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                fontWeight: 500
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ⚙️ Add Prompt
            </button>
            <select style={selectStyle} value={ageGroupFilter} onChange={(e) => setAgeGroupFilter(e.target.value)}>
              <option value="Kids">Age Group: Kids</option>
              <option value="Teens">Age Group: Teens</option>
              <option value="Adults">Age Group: Adults</option>
            </select>
            <select style={selectStyle} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="A1">Level: A1</option>
              <option value="A2">Level: A2</option>
              <option value="B1">Level: B1</option>
              <option value="B2">Level: B2</option>
              <option value="C1">Level: C1</option>
            </select>
          </div>
        </header>

        {/* GLOBAL STUDENT PICKER */}
        <div style={{
          margin: '0 3rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setIsClassListModalOpen(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            👥 Class List
          </button>
          
          <div style={{ flex: 1 }}></div>

          <div style={{
            minWidth: '220px',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            border: '1px dashed rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: pickedStudent ? 'var(--color-primary)' : 'var(--color-text-muted)',
            transition: 'all 0.3s ease'
          }}>
            {pickedStudent ? `👉 It is ${pickedStudent}'s turn!` : 'No student picked yet'}
          </div>

          <button
            onClick={handlePickStudent}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(255, 209, 0, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 209, 0, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 209, 0, 0.3)';
            }}
          >
            🎲 PICK STUDENT
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <main style={{
          flex: 1,
          padding: '1rem 3rem 3rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {activeTab === 'Role-Play Roulette' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
              {roleplayPrompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 ROLE-PLAYS FOUND
                </div>
              ) : (
                <div className="premium-card" style={{
                  width: '100%',
                  maxWidth: '900px',
                  padding: '5rem 4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '4rem',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => handleDelete(roleplayPrompts[currentRoleplayIndex].id, 'roleplay_prompts')}
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      background: 'transparent',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Delete Prompt"
                  >
                    🗑️
                  </button>

                  <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>Situation</h2>
                    <p style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4 }}>
                      {roleplayPrompts[currentRoleplayIndex]?.situation}
                    </p>
                  </div>

                  <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>Your Role</h2>
                    <p style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1.4 }}>
                      {roleplayPrompts[currentRoleplayIndex]?.role}
                    </p>
                  </div>

                  <button style={{
                    marginTop: '2rem',
                    backgroundColor: 'var(--color-primary)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '1.25rem 6rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(255, 209, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 0 35px rgba(255, 209, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 209, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)';
                  }}
                  onClick={handleSpin}
                  >
                    Spin
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'Visual Prompts' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
              
              {prompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 PROMPTS FOUND
                </div>
              ) : (
                <div className="premium-card" style={{
                  width: '100%',
                  maxWidth: '900px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <button 
                    onClick={() => handleDelete(prompts[currentPromptIndex].id, 'visual_prompts')}
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      background: 'transparent',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Delete Prompt"
                  >
                    🗑️
                  </button>
                  <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <img 
                      src={prompts[currentPromptIndex]?.image_url} 
                      alt="Visual Prompt" 
                      style={{ width: '100%', height: '500px', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                  </div>
                  
                  <div style={{ 
                    width: '100%', 
                    padding: '3.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '2.5rem' 
                  }}>
                    <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {prompts[currentPromptIndex]?.question?.split('\n').map((line: string, i: number) => (
                        <p key={i} style={{ fontSize: '2.2rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4, margin: 0 }}>
                          {line}
                        </p>
                      ))}
                    </div>

                    <button style={{
                      backgroundColor: '#FFD100',
                      color: '#000000',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '1.25rem 4rem',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 209, 0, 0.6), 0 6px 16px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onClick={handleNextPrompt}
                  >
                    Next Prompt
                  </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'Taboo Generator' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
              {tabooPrompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 TABOO WORDS FOUND
                </div>
              ) : (
                <div className="premium-card" style={{
                  width: '100%',
                  maxWidth: '500px',
                  padding: '4rem 3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '2.5rem',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => handleDelete(tabooPrompts[currentTabooIndex].id, 'taboo_prompts')}
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      background: 'transparent',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Delete Prompt"
                  >
                    🗑️
                  </button>

                  <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>Target Word</h2>
                    <p style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.2, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                      {tabooPrompts[currentTabooIndex]?.target_word}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '0.5rem' }}>Taboo Words</h2>
                    {tabooPrompts[currentTabooIndex]?.taboo_words?.split('\n').map((word: string, i: number) => (
                      <div key={i} style={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem'
                      }}>
                        <span style={{ color: '#EF4444', fontWeight: 'bold' }}>✕</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {word}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button style={{
                    marginTop: '2rem',
                    backgroundColor: 'var(--color-primary)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '1.25rem 4rem',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 209, 0, 0.6), 0 6px 16px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onClick={handleNextTaboo}
                  >
                    Next Word
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'Pitch Perfect' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
              {pitchPrompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 PITCHES FOUND
                </div>
              ) : (
                <div className="premium-card" style={{
                  width: '100%',
                  maxWidth: '700px',
                  padding: '4rem 3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '2.5rem',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => handleDelete(pitchPrompts[currentPitchIndex].id, 'pitch_prompts')}
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      background: 'transparent',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Delete Prompt"
                  >
                    🗑️
                  </button>

                  <div>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>Product Name</h2>
                    <p style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.2, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                      {pitchPrompts[currentPitchIndex]?.product_name}
                    </p>
                  </div>

                  <div style={{ width: '100%', marginTop: '1rem' }}>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>Description</h2>
                    <p style={{ fontSize: '1.75rem', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                      {pitchPrompts[currentPitchIndex]?.description}
                    </p>
                  </div>

                  <button style={{
                    marginTop: '2rem',
                    backgroundColor: 'var(--color-primary)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '1.25rem 4rem',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 209, 0, 0.6), 0 6px 16px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onClick={handleNextPitch}
                  >
                    Next Pitch
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'Action Wheel' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
              {actionPrompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 ACTIONS FOUND
                </div>
              ) : (
                <div className="premium-card" style={{
                  width: '100%',
                  maxWidth: '800px',
                  padding: '4rem 3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <button 
                    onClick={() => handleDelete(actionPrompts[currentActionIndex].id, 'action_prompts')}
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      background: 'transparent',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Delete Prompt"
                  >
                    🗑️
                  </button>

                  <div style={{ position: 'relative', width: '400px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
                    
                    {/* Pointer */}
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      zIndex: 20,
                      width: 0,
                      height: 0,
                      borderLeft: '25px solid transparent',
                      borderRight: '25px solid transparent',
                      borderTop: '45px solid #EF4444',
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))'
                    }} />

                    {/* Wheel Element */}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'conic-gradient(#FFD100 0deg 45deg, #3B82F6 45deg 90deg, #EF4444 90deg 135deg, #10B981 135deg 180deg, #8B5CF6 180deg 225deg, #FFD100 225deg 270deg, #3B82F6 270deg 315deg, #EF4444 315deg 360deg)',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.75), inset 0 0 30px rgba(0,0,0,0.5)',
                      border: '12px solid #111827',
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: 'transform 3000ms cubic-bezier(0.25, 1, 0.5, 1)',
                    }} />
                    
                    {/* Center Pin */}
                    <div style={{
                      position: 'absolute',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#1f2937',
                      border: '5px solid #FFD100',
                      zIndex: 10,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }} />
                  </div>

                  <div style={{
                    width: '100%',
                    padding: '2rem',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                    minHeight: '180px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.4s ease',
                    filter: isWheelSpinning ? 'blur(12px)' : 'blur(0px)',
                    opacity: isWheelSpinning ? 0.3 : 1,
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
                  }}>
                    <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.3, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
                      {actionPrompts[currentActionIndex]?.action_text}
                    </p>
                  </div>

                  <button 
                    disabled={isWheelSpinning}
                    style={{
                      marginTop: '1rem',
                      backgroundColor: isWheelSpinning ? '#777' : 'var(--color-primary)',
                      color: isWheelSpinning ? '#444' : '#000',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '1.25rem 4rem',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      cursor: isWheelSpinning ? 'not-allowed' : 'pointer',
                      boxShadow: isWheelSpinning ? 'none' : '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      width: '100%'
                    }}
                    onMouseOver={(e) => {
                      if (!isWheelSpinning) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 209, 0, 0.6), 0 6px 16px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isWheelSpinning) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 209, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onClick={handleSpinAction}
                  >
                    {isWheelSpinning ? 'Spinning...' : 'Spin The Wheel'}
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'Hangman' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
              {hangmanPrompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 WORDS FOUND
                </div>
              ) : (
                <div className="premium-card" style={{
                  width: '100%',
                  maxWidth: '900px',
                  padding: '4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '2.5rem',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => handleDelete(hangmanPrompts[currentHangmanIndex].id, 'hangman_words')}
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      background: 'transparent',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Delete Prompt"
                  >
                    🗑️
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 2rem' }}>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-text-muted)', fontSize: '1.1rem', margin: 0 }}>Hangman</h2>
                    <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px', color: mistakes >= 6 ? '#EF4444' : 'var(--color-text-muted)', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Mistakes: {mistakes} / 6</h2>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', margin: '2rem 0' }}>
                    {(hangmanPrompts[currentHangmanIndex]?.word?.toUpperCase() || '').split('').map((char: string, i: number) => {
                      const isRevealed = guessedLetters.includes(char) || mistakes >= 6;
                      const isSpace = char === ' ';
                      return (
                        <div key={i} style={{
                          width: isSpace ? '2rem' : '4rem',
                          height: isSpace ? '4rem' : '5rem',
                          borderBottom: isSpace ? 'none' : '4px solid var(--color-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3.5rem',
                          fontWeight: 800,
                          color: mistakes >= 6 && !guessedLetters.includes(char) ? '#EF4444' : 'var(--color-text)'
                        }}>
                          {isRevealed && !isSpace ? char : ''}
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const hint = hangmanPrompts[currentHangmanIndex]?.hint;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minHeight: '3rem' }}>
                        {hint && !showHint && (
                          <button 
                            onClick={() => setShowHint(true)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--color-text-muted)', padding: '0.5rem 1rem', borderRadius: '100px', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.9rem' }}
                            onMouseOver={e => e.currentTarget.style.color = '#FFD100'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                          >
                            💡 Need a hint?
                          </button>
                        )}
                        {hint && showHint && (
                          <div style={{ color: '#FFD100', fontSize: '1.1rem', fontStyle: 'italic', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                            💡 {hint}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {(() => {
                    const word = hangmanPrompts[currentHangmanIndex]?.word?.toUpperCase() || '';
                    const isWin = word.length > 0 && word.split('').every((char: string) => char === ' ' || guessedLetters.includes(char));
                    const isGameOver = mistakes >= 6;
                    
                    if (isGameOver) {
                      return <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#EF4444', letterSpacing: '2px', animation: 'pulse 2s infinite' }}>GAME OVER</div>;
                    }
                    if (isWin) {
                      return <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10B981', letterSpacing: '2px', animation: 'bounce 2s infinite' }}>YOU WIN!</div>;
                    }
                    
                    const keyboardRows = [
                      ['Q','W','E','R','T','Y','U','I','O','P'],
                      ['A','S','D','F','G','H','J','K','L'],
                      ['Z','X','C','V','B','N','M']
                    ];
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', width: '100%', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                          <button
                            onClick={handleRevealLetter}
                            disabled={letterHintsUsed >= 2 || isGameOver || isWin}
                            style={{
                              background: 'transparent',
                              border: `1px solid ${letterHintsUsed >= 2 ? 'rgba(255,255,255,0.1)' : '#FFD100'}`,
                              color: letterHintsUsed >= 2 ? 'var(--color-text-muted)' : '#FFD100',
                              padding: '0.5rem 1.5rem',
                              borderRadius: '100px',
                              cursor: letterHintsUsed >= 2 ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              opacity: letterHintsUsed >= 2 ? 0.5 : 1
                            }}
                            onMouseOver={e => { if(letterHintsUsed < 2) { e.currentTarget.style.background = '#FFD100'; e.currentTarget.style.color = '#000'; } }}
                            onMouseOut={e => { if(letterHintsUsed < 2) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFD100'; } }}
                          >
                            🔍 Reveal Letter ({2 - letterHintsUsed} left)
                          </button>
                          <button
                            onClick={handleGiveUp}
                            disabled={isGameOver || isWin}
                            style={{
                              background: 'transparent',
                              border: `1px solid ${isGameOver || isWin ? 'rgba(255,255,255,0.1)' : '#EF4444'}`,
                              color: isGameOver || isWin ? 'var(--color-text-muted)' : '#EF4444',
                              padding: '0.5rem 1.5rem',
                              borderRadius: '100px',
                              cursor: isGameOver || isWin ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              opacity: isGameOver || isWin ? 0.5 : 1
                            }}
                            onMouseOver={e => { if(!isGameOver && !isWin) { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; } }}
                            onMouseOut={e => { if(!isGameOver && !isWin) { e.currentTarget.style.background = 'transparent'; } }}
                          >
                            👁️ Reveal Word
                          </button>
                        </div>
                        {keyboardRows.map((row, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            {row.map(letter => {
                              const isGuessed = guessedLetters.includes(letter);
                              const isCorrect = isGuessed && word.includes(letter);
                              const isWrong = isGuessed && !word.includes(letter);
                              
                              let bg = 'rgba(255, 255, 255, 0.05)';
                              let color = 'var(--color-text)';
                              let border = '1px solid rgba(255, 255, 255, 0.1)';
                              
                              if (isCorrect) {
                                bg = 'rgba(16, 185, 129, 0.2)';
                                color = '#10B981';
                                border = '1px solid rgba(16, 185, 129, 0.5)';
                              } else if (isWrong) {
                                bg = 'rgba(239, 68, 68, 0.2)';
                                color = '#EF4444';
                                border = '1px solid rgba(239, 68, 68, 0.5)';
                              }
                              
                              return (
                                <button
                                  key={letter}
                                  onClick={() => handleGuess(letter)}
                                  disabled={isGuessed}
                                  style={{
                                    width: '3rem',
                                    height: '3.5rem',
                                    borderRadius: '8px',
                                    backgroundColor: bg,
                                    color: color,
                                    border: border,
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    cursor: isGuessed ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isGuessed ? 0.7 : 1
                                  }}
                                  onMouseOver={e => {
                                    if (!isGuessed) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                  }}
                                  onMouseOut={e => {
                                    if (!isGuessed) e.currentTarget.style.backgroundColor = bg;
                                  }}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <button style={{
                    marginTop: '2rem',
                    backgroundColor: 'var(--color-primary)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '1.25rem 6rem',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(255, 209, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 0 35px rgba(255, 209, 0, 0.6), 0 6px 20px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 209, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)';
                  }}
                  onClick={handleNextHangman}>
                    NEXT WORD
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'Sentence Builder' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem', height: '100%' }}>
              {sentenceBuilderPrompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 SENTENCES FOUND
                </div>
              ) : (
                <SentenceBuilder
                  key={sentenceBuilderPrompts[currentSentenceBuilderIndex]?.id}
                  id={sentenceBuilderPrompts[currentSentenceBuilderIndex]?.id}
                  scrambledWords={sentenceBuilderPrompts[currentSentenceBuilderIndex]?.scrambled_words}
                  correctSentence={sentenceBuilderPrompts[currentSentenceBuilderIndex]?.correct_sentence}
                  onDelete={(id) => handleDelete(id, 'sentence_builder')}
                  onNext={handleNextSentenceBuilder}
                />
              )}
            </div>
          ) : activeTab === 'Time Bomb' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem', height: '100%' }}>
              {timeBombPrompts.length === 0 ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  0 TIME BOMBS FOUND
                </div>
              ) : (
                <TimeBomb
                  key={timeBombPrompts[currentTimeBombIndex]?.id}
                  id={timeBombPrompts[currentTimeBombIndex]?.id}
                  promptText={timeBombPrompts[currentTimeBombIndex]?.prompt_text}
                  timeLimit={timeBombPrompts[currentTimeBombIndex]?.time_limit}
                  onDelete={(id) => handleDelete(id, 'time_bomb')}
                  onNext={handleNextTimeBomb}
                />
              )}
            </div>
          ) : (
            <div className="premium-card" style={{ padding: '3rem', textAlign: 'center', minWidth: '400px' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                {navItems.find(item => item.name === activeTab)?.icon}
              </div>
              <h2 style={{ fontSize: '2rem', color: navItems.find(item => item.name === activeTab)?.color }}>{activeTab}</h2>
              <p style={{ marginTop: '1rem' }}>Coming soon...</p>
            </div>
          )}
        </main>
      </div>

      {/* ADMIN ADD PROMPT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="premium-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>Add New Prompt</h3>
            
            {activeTab === 'Visual Prompts' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Image Upload</label>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        setNewPrompt({...newPrompt, file: e.target.files[0]});
                      }
                    }}
                    style={{ ...inputStyle, padding: '0.5rem' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Question</label>
                  <textarea 
                    value={newPrompt.question}
                    onChange={e => setNewPrompt({...newPrompt, question: e.target.value})}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' }}
                    rows={4}
                    placeholder="Question 1...&#10;Question 2..."
                  />
                </div>
              </>
            ) : activeTab === 'Role-Play Roulette' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Situation</label>
                  <textarea 
                    value={newPrompt.situation}
                    onChange={e => setNewPrompt({...newPrompt, situation: e.target.value})}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                    rows={3}
                    placeholder="Describe the situation..."
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Role</label>
                  <textarea 
                    value={newPrompt.role}
                    onChange={e => setNewPrompt({...newPrompt, role: e.target.value})}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                    rows={3}
                    placeholder="Describe the student's role..."
                  />
                </div>
              </>
            ) : activeTab === 'Taboo Generator' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Target Word</label>
                  <input 
                    type="text"
                    value={newPrompt.targetWord}
                    onChange={e => setNewPrompt({...newPrompt, targetWord: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. APPLE"
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Taboo Words (One per line)</label>
                  <textarea 
                    value={newPrompt.tabooWords}
                    onChange={e => setNewPrompt({...newPrompt, tabooWords: e.target.value})}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
                    rows={5}
                    placeholder="FRUIT&#10;RED&#10;TREE&#10;STEVE JOBS"
                  />
                </div>
              </>
            ) : activeTab === 'Pitch Perfect' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Product Name</label>
                  <input 
                    type="text"
                    value={newPrompt.productName}
                    onChange={e => setNewPrompt({...newPrompt, productName: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. Smart Goggles"
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Description</label>
                  <textarea 
                    value={newPrompt.description}
                    onChange={e => setNewPrompt({...newPrompt, description: e.target.value})}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
                    rows={5}
                    placeholder="Describe the product and its features..."
                  />
                </div>
              </>
            ) : activeTab === 'Action Wheel' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Action Text</label>
                  <textarea 
                    value={newPrompt.actionText}
                    onChange={e => setNewPrompt({...newPrompt, actionText: e.target.value})}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
                    rows={5}
                    placeholder="Describe the action..."
                  />
                </div>
              </>
            ) : activeTab === 'Hangman' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Target Word</label>
                  <input 
                    type="text" 
                    value={newPrompt.targetWord}
                    onChange={e => setNewPrompt({...newPrompt, targetWord: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. ELEPHANT"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Hint (Optional)</label>
                  <input 
                    type="text" 
                    value={newPrompt.hint}
                    onChange={e => setNewPrompt({...newPrompt, hint: e.target.value})}
                    style={inputStyle}
                    placeholder="Enter an optional hint or definition..."
                  />
                </div>
              </>
            ) : activeTab === 'Sentence Builder' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Topic (Optional)</label>
                  <input 
                    type="text" 
                    value={newPrompt.topic}
                    onChange={e => setNewPrompt({...newPrompt, topic: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. Past Tense"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Correct Sentence</label>
                  <input 
                    type="text" 
                    value={newPrompt.correctSentence}
                    onChange={e => setNewPrompt({...newPrompt, correctSentence: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. I went to the cinema yesterday"
                  />
                </div>
              </>
            ) : activeTab === 'Time Bomb' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Topic (Optional)</label>
                  <input 
                    type="text" 
                    value={newPrompt.topic}
                    onChange={e => setNewPrompt({...newPrompt, topic: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. Vocabulary"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Prompt Text / Challenge</label>
                  <textarea 
                    value={newPrompt.promptText}
                    onChange={e => setNewPrompt({...newPrompt, promptText: e.target.value})}
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    placeholder="e.g. Name 3 things you find in a kitchen"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Time Limit (Seconds)</label>
                  <input 
                    type="number"
                    min="5"
                    max="120"
                    value={newPrompt.timeLimit}
                    onChange={e => setNewPrompt({...newPrompt, timeLimit: parseInt(e.target.value) || 15})}
                    style={inputStyle}
                  />
                </div>
              </>
            ) : null}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Level</label>
                <select 
                  value={newPrompt.level}
                  onChange={e => setNewPrompt({...newPrompt, level: e.target.value})}
                  style={{ ...inputStyle, cursor: 'pointer', color: 'white', appearance: 'auto' }}
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Age Group</label>
                <select 
                  value={newPrompt.ageGroup}
                  onChange={e => setNewPrompt({...newPrompt, ageGroup: e.target.value})}
                  style={{ ...inputStyle, cursor: 'pointer', color: 'white', appearance: 'auto' }}
                >
                  <option value="Kids">Kids</option>
                  <option value="Teens">Teens</option>
                  <option value="Adults">Adults</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ ...buttonStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                Cancel
              </button>
              <button 
                onClick={handleSavePrompt} 
                disabled={isUploading}
                style={{ ...buttonStyle, background: isUploading ? '#665400' : '#FFD100', color: isUploading ? '#aaa' : '#000', border: 'none' }}
              >
                {isUploading ? 'Uploading...' : 'Save Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLASS LIST MODAL */}
      {isClassListModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="premium-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>👥 Class List</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Enter student names below, one name per line.</p>
            
            <textarea
              value={studentNames}
              onChange={(e) => setStudentNames(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '200px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              rows={8}
              placeholder="e.g.&#10;Alice&#10;Bob&#10;Charlie"
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button 
                onClick={() => setStudentNames('')}
                style={{ ...buttonStyle, background: 'transparent', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                🗑️ Clear All
              </button>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setIsClassListModalOpen(false)} style={{ ...buttonStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                  Cancel
                </button>
                <button 
                  onClick={() => setIsClassListModalOpen(false)} 
                  style={{ ...buttonStyle, background: 'var(--color-primary)', color: '#000', border: 'none' }}
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '0.85rem',
  color: '#FFF',
  fontSize: '1rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.2s ease'
};

const selectStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'var(--color-text)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 500,
  outline: 'none',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  fontFamily: 'inherit',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1em',
  paddingRight: '3rem'
};

export default App;
