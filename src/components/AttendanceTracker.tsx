import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Users, Check, X, ClipboardCheck, GraduationCap, CalendarDays, ListChecks, UserPlus, Trash2, Download, BookOpen, MessageSquare, Plus, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Student {
  id: string;
  name: string;
  status: 'unmarked' | 'present' | 'absent';
  color: string;
}

interface Note {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  timestamp: string;
}

const avatarColors = [
  'bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/50',
  'bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/50',
  'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/50',
  'bg-[#f43f5e]/20 text-[#fb7185] border-[#f43f5e]/50',
  'bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/50',
];

export default function AttendanceTracker() {
  const [teacher, setTeacher] = useState('IMANE HIMMICH');
  const [className, setClassName] = useState('Grade 7 — Science');
  const [level, setLevel] = useState('A1');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [newStudentName, setNewStudentName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<string>('');
  const [currentNoteText, setCurrentNoteText] = useState('');
  
  const printRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Emma Johnson', status: 'unmarked', color: avatarColors[0] },
    { id: '2', name: 'Liam Rodriguez', status: 'unmarked', color: avatarColors[1] },
    { id: '3', name: 'Sophia Chen', status: 'unmarked', color: avatarColors[2] },
    { id: '4', name: 'Noah Williams', status: 'unmarked', color: avatarColors[3] },
  ]);

  useEffect(() => {
    const fetchLatestSession = async () => {
      try {
        const { data, error } = await supabase
          .from('attendance_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching latest session:', error);
          }
          return;
        }
        
        if (data) {
          if (data.teacher) setTeacher(data.teacher);
          if (data.class_name) setClassName(data.class_name);
          if (data.level) setLevel(data.level);
          if (data.date) setDate(data.date);
          if (data.students) setStudents(data.students);
          if (data.notes) setNotes(data.notes);
        }
      } catch (err) {
        console.error('Unexpected error fetching session:', err);
      }
    };
    
    fetchLatestSession();
  }, []);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const element = printRef.current;
    const btnContainer = document.getElementById('pdf-action-buttons');

    try {
      if (!element) return;
      if (btnContainer) btnContainer.style.display = 'none';

      // Force the element to its full scroll height
      const origHeight = element.style.height;
      const origOverflow = element.style.overflow;
      element.style.height = 'max-content';
      element.style.overflow = 'visible';

      // Small delay for DOM repaint
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await toPng(element, { 
        backgroundColor: '#ffffff',
        pixelRatio: 2 // High resolution
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add extra pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight; // Shift image up
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Attendance_Sheet_${date}.pdf`);

      // Restore styles
      element.style.height = origHeight;
      element.style.overflow = origOverflow;

    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      if (btnContainer) btnContainer.style.display = 'flex';
      setIsDownloading(false);
    }
  };

  const handleSaveSession = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      setSaveMessage('');
      
      const { error } = await supabase
        .from('attendance_sessions')
        .insert([
          {
            teacher,
            class_name: className,
            level,
            date,
            students,
            notes
          }
        ]);
        
      if (error) throw error;
      
      setSaveMessage('Session saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving session:', err);
      setSaveMessage('Failed to save session.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const markedCount = presentCount + absentCount;
  const progressPercentage = totalStudents === 0 ? 0 : Math.round((markedCount / totalStudents) * 100);

  const setStatus = (id: string, newStatus: 'present' | 'absent') => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const randomColor = avatarColors[students.length % avatarColors.length];
    setStudents([...students, {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      status: 'unmarked',
      color: randomColor
    }]);
    setNewStudentName('');
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    setNotes(notes.filter(n => n.studentId !== id));
  };

  useEffect(() => {
    if (students.length > 0 && !selectedStudentForNote) {
      setSelectedStudentForNote(students[0].id);
    } else if (students.length === 0) {
      setSelectedStudentForNote('');
    }
  }, [students, selectedStudentForNote]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForNote || !currentNoteText.trim()) return;
    const student = students.find(s => s.id === selectedStudentForNote);
    if (!student) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      text: currentNoteText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotes([...notes, newNote]);
    setCurrentNoteText('');
  };

  return (
    <div ref={printRef} className="w-full max-w-[1200px] mx-auto flex flex-col gap-[40px] pb-[80px] mt-[20px] bg-white print:block print:w-full print:overflow-visible">

      {/* HEADER & INFO ROW */}
      <div className="bg-white border border-[#e2e8f0] rounded-[40px] p-[32px] md:p-[40px] flex flex-col gap-[40px]  relative">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e2e8f0] pb-[32px]">
          <div className="flex items-center gap-[24px]">
            <div className="p-[20px] bg-[#FFD100]/10 rounded-[24px]">
              <ClipboardCheck className="text-[#FFD100]" size={40} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#94a3b8] tracking-[0.2em] uppercase mb-[4px]">Attendance Module</div>
              <h1 className="text-[40px] md:text-[56px] font-black text-[#0f172a] leading-none tracking-tight">Attendance Sheet</h1>
            </div>
          </div>
          <div className="flex flex-col items-end gap-[8px]">
            <div id="pdf-action-buttons" className="flex gap-[16px] print:hidden">
              <button 
                onClick={handleSaveSession}
                disabled={isSaving}
                className="flex items-center gap-2 bg-white border border-[#e2e8f0] text-[#0f172a] font-black uppercase tracking-widest px-6 py-4 rounded-xl hover:bg-[#f8fafc] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
              >
                <Save size={24} className={isSaving ? "animate-pulse" : ""} /> 
                {isSaving ? 'SAVING...' : 'SAVE SESSION'}
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-[#FFD100] text-black font-black uppercase tracking-widest px-6 py-4 rounded-xl hover:bg-[#facc15] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
              >
                <Download size={24} className={isDownloading ? "animate-bounce" : ""} /> 
                {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD PDF'}
              </button>
            </div>
            {saveMessage && (
              <div className={`text-[12px] font-bold tracking-widest uppercase ${saveMessage.includes('Failed') ? 'text-[#f43f5e]' : 'text-[#10b981]'}`}>
                {saveMessage}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
          <div className="flex flex-col gap-[12px]">
            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-widest ml-[8px]">Teacher</label>
            <div className="flex items-center gap-[16px] bg-[#f8fafc] border border-[#e2e8f0] px-[24px] py-[20px] rounded-[16px] focus-within:border-[#FFD100] transition-colors">
              <GraduationCap size={24} className="text-[#475569] shrink-0" />
              <input
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="bg-transparent outline-none w-full text-[#0f172a] font-bold text-[20px] uppercase placeholder:text-[#94a3b8]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-[12px]">
            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-widest ml-[8px]">Class & Level</label>
            <div className="flex items-center bg-[#f8fafc] border border-[#e2e8f0] px-[24px] py-[20px] rounded-[16px] focus-within:border-[#FFD100] transition-colors">
              <BookOpen size={24} className="text-[#475569] shrink-0 mr-[16px]" />
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Class name..."
                className="bg-transparent outline-none w-full text-[#0f172a] font-bold text-[20px] uppercase placeholder:text-[#94a3b8]"
              />
              <div className="w-[1px] h-[32px] bg-[#e2e8f0] mx-[16px]"></div>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                className="bg-transparent text-[#334155] font-bold text-[20px] outline-none cursor-pointer uppercase appearance-none"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-[12px]">
            <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-widest ml-[8px]">Date</label>
            <div className="flex items-center gap-[16px] bg-[#f8fafc] border border-[#e2e8f0] px-[24px] py-[20px] rounded-[16px] focus-within:border-[#FFD100] transition-colors">
              <CalendarDays size={24} className="text-[#475569] shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent outline-none w-full text-[#0f172a] font-bold text-[20px] uppercase [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[24px] p-[32px] flex flex-col items-center justify-center">
            <Users size={32} className="text-[#475569] mb-[12px]" />
            <div className="text-[48px] font-black text-[#0f172a] leading-none">{totalStudents}</div>
            <div className="text-[14px] font-bold text-[#64748b] uppercase tracking-widest mt-[8px]">Total Enrolled</div>
          </div>
          <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-[24px] p-[32px] flex flex-col items-center justify-center">
            <Check size={32} className="text-[#10b981] mb-[12px]" />
            <div className="text-[48px] font-black text-[#10b981] leading-none">{presentCount}</div>
            <div className="text-[14px] font-bold text-[#10b981] uppercase tracking-widest mt-[8px]">Present</div>
          </div>
          <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-[24px] p-[32px] flex flex-col items-center justify-center">
            <X size={32} className="text-[#f43f5e] mb-[12px]" />
            <div className="text-[48px] font-black text-[#f43f5e] leading-none">{absentCount}</div>
            <div className="text-[14px] font-bold text-[#f43f5e] uppercase tracking-widest mt-[8px]">Absent</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[32px] p-[32px] flex flex-col gap-[20px] ">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-[12px] text-[#334155]">
            <ListChecks size={28} className="text-[#FFD100]" />
            <div className="text-[24px] font-black tracking-wide">
              {markedCount} <span className="text-[#64748b]">of</span> {totalStudents} <span className="text-[#64748b]">marked</span>
            </div>
          </div>
          <div className="text-[32px] font-black text-[#FFD100]">{progressPercentage}%</div>
        </div>
        <div className="w-full h-[16px] bg-[#f1f5f9] rounded-full overflow-hidden border border-[#e2e8f0]">
          <div
            className="h-full bg-[#FFD100] transition-all duration-700 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[40px] p-[32px] md:p-[40px] flex flex-col gap-[40px] ">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-[32px] border-b border-[#e2e8f0] pb-[40px]">
          <div className="flex items-center gap-[20px]">
            <div className="p-[16px] bg-[#f1f5f9] rounded-[16px] border border-[#e2e8f0]">
              <Users className="text-[#FFD100]" size={32} />
            </div>
            <div className="text-[36px] font-black text-[#0f172a]">Students</div>
          </div>

          <form onSubmit={addStudent} className="flex w-full xl:w-auto gap-[16px]">
            <input
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Type new student name..."
              className="flex-1 xl:w-[400px] px-[32px] py-[20px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] outline-none text-[#0f172a] text-[20px] focus:border-[#FFD100] transition-all placeholder:text-[#94a3b8]"
            />
            <button
              type="submit"
              disabled={!newStudentName}
              className="shrink-0 bg-[#FFD100] text-black px-[40px] py-[20px] rounded-[16px] font-black text-[20px] hover:bg-[#facc15] disabled:opacity-50 flex items-center gap-[12px] transition-all"
            >
              <UserPlus size={24} /> ADD
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-[20px]">
          {students.length === 0 ? (
            <div className="text-center p-[64px] text-[#64748b] text-[20px] font-medium border-2 border-dashed border-[#e2e8f0] rounded-[24px] bg-[#f8fafc]">
              No students enrolled yet. Add your first student above!
            </div>
          ) : students.map((student, index) => {
            const isPresent = student.status === 'present';
            const isAbsent = student.status === 'absent';

            return (
              <div key={student.id} className="flex flex-col xl:flex-row items-center justify-between p-[24px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] hover:border-[#e2e8f0] transition-all gap-[24px]">

                <div className="flex items-center gap-[24px] w-full xl:w-auto">
                  <div className="text-[20px] font-black text-[#94a3b8] w-[40px] text-right">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <div className={`w-[64px] h-[64px] rounded-full flex items-center justify-center text-[24px] font-black border-2 ${student.color}`}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-[24px] font-bold text-[#0f172a] tracking-wide">
                    {student.name}
                  </div>
                </div>

                <div className="flex items-center gap-[16px] w-full xl:w-auto justify-end shrink-0">
                  <button
                    onClick={() => setStatus(student.id, 'present')}
                    className={`px-[32px] py-[16px] text-[16px] font-black tracking-widest uppercase rounded-[12px] flex items-center gap-[12px] transition-all ${isPresent
                      ? 'bg-[#10b981] text-black scale-105'
                      : 'bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] hover:border-[#10b981]/50 hover:text-[#10b981]'
                      }`}
                  >
                    <Check size={20} strokeWidth={3} /> PRESENT
                  </button>
                  <button
                    onClick={() => setStatus(student.id, 'absent')}
                    className={`px-[32px] py-[16px] text-[16px] font-black tracking-widest uppercase rounded-[12px] flex items-center gap-[12px] transition-all ${isAbsent
                      ? 'bg-[#f43f5e] text-[#0f172a] scale-105'
                      : 'bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] hover:border-[#f43f5e]/50 hover:text-[#f43f5e]'
                      }`}
                  >
                    <X size={20} strokeWidth={3} /> ABSENT
                  </button>

                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="p-[16px] ml-[8px] rounded-[12px] text-[#64748b] hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 border border-transparent hover:border-[#f43f5e]/20 transition-all"
                    title="Delete Student"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[24px] p-[32px] flex flex-col gap-[24px] ">
        <div className="flex items-center gap-[16px] border-b border-[#e2e8f0] pb-[20px]">
          <MessageSquare size={28} className="text-[#FFD100]" />
          <h2 className="text-[24px] font-black text-[#0f172a] uppercase tracking-widest">Session Notes & Observations</h2>
        </div>

        <form onSubmit={handleAddNote} className="flex flex-col gap-[16px]">
          <div className="flex flex-col md:flex-row gap-[16px]">
            <select
              value={selectedStudentForNote}
              onChange={(e) => setSelectedStudentForNote(e.target.value)}
              className="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] font-bold text-[18px] outline-none cursor-pointer rounded-[12px] px-[20px] py-[16px] focus:border-[#FFD100] md:w-[300px]"
            >
              <option value="" disabled>Select a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <textarea
              value={currentNoteText}
              onChange={(e) => setCurrentNoteText(e.target.value)}
              placeholder="Type an observation about this student..."
              className="bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-[18px] outline-none rounded-[12px] px-[20px] py-[16px] focus:border-[#FFD100] flex-1 resize-y min-h-[56px]"
              rows={1}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedStudentForNote || !currentNoteText.trim()}
              className="bg-[#FFD100] text-black font-black uppercase tracking-widest px-[32px] py-[16px] rounded-[12px] hover:bg-[#facc15] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:-translate-y-0 flex items-center gap-[8px]"
            >
              <Plus size={20} strokeWidth={3} /> Add Note
            </button>
          </div>
        </form>

        {notes.length > 0 && (
          <div className="flex flex-col gap-[16px] mt-[16px]">
            {notes.map(note => (
              <div key={note.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-[20px] flex flex-col gap-[8px]">
                <div className="flex justify-between items-center">
                  <div className="font-black text-[#0f172a] text-[18px]">{note.studentName}</div>
                  <div className="text-[#94a3b8] font-bold text-[14px]">{note.timestamp}</div>
                </div>
                <div className="text-[#334155] text-[16px] whitespace-pre-wrap">{note.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}