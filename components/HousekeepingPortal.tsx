import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskLog } from '../types';

interface Props {
    tasks: TaskLog[];
    onClose: () => void;
    flatNo: string;
}

const HousekeepingPortal: React.FC<Props> = ({ tasks, onClose, flatNo }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Filter tasks for the specific flat (redundant if checking at parent, but good for safety)
    const flatTasks = useMemo(() => {
        return tasks.filter(t => t.flat_no && t.flat_no.toLowerCase() === flatNo.toLowerCase());
    }, [tasks, flatNo]);

    // Group tasks by date string (YYYY-MM-DD or Locale Date String)
    const taskDates = useMemo(() => {
        const dates = new Set<string>();
        flatTasks.forEach(task => {
            const dateStr = task.timestamp ? task.timestamp : task.created_at;
            dates.add(new Date(dateStr).toDateString());
        });
        return dates;
    }, [flatTasks]);

    // Tasks for selected date
    const currentTasks = useMemo(() => {
        return flatTasks.filter(t => {
            const dateStr = t.timestamp ? t.timestamp : t.created_at;
            return new Date(dateStr).toDateString() === selectedDate.toDateString();
        });
    }, [flatTasks, selectedDate]);

    // Generate calendar days (current month)
    const getCalendarDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        // Prefix padding
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        // Days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const calendarDays = useMemo(() => getCalendarDays(selectedDate), [selectedDate]);

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedDate(newDate);
    };

    return (
        <div className="fixed inset-0 bg-[#0f172a] z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">

            {/* Header */}
            <div className="p-4 flex items-center gap-4 bg-white/5 border-b border-white/10">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="text-white" />
                </button>
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">Housekeeping</h2>
                    <p className="text-xs text-slate-400 font-bold">Portal for {flatNo}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">

                {/* Simple Calendar */}
                <div className="bg-white/5 rounded-3xl p-4 border border-white/10 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="text-white" /></button>
                        <span className="text-white font-bold text-sm tracking-widest uppercase">
                            {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/10 rounded"><ChevronRight className="text-white" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] text-slate-500 font-bold">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            const isToday = day && day.toDateString() === new Date().toDateString();
                            const isSelected = day && day.toDateString() === selectedDate.toDateString();
                            const hasTask = day && taskDates.has(day.toDateString());

                            return (
                                <div key={idx} className="aspect-square flex items-center justify-center relative">
                                    {day && (
                                        <button
                                            onClick={() => setSelectedDate(day)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative
                                        ${isSelected ? 'bg-indigo-500 text-white shadow-lg scale-110' :
                                                    isToday ? 'bg-white/10 text-cyan-400 border border-cyan-400/30' : 'text-slate-400 hover:bg-white/5'}
                                    `}
                                        >
                                            {day.getDate()}
                                            {hasTask && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></div>}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Task List */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 ml-2">Updates for {selectedDate.toLocaleDateString()}</h3>

                    {currentTasks.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <Calendar size={48} className="mx-auto mb-2 text-slate-400" />
                            <p className="text-sm font-bold text-slate-400">No updates logged.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentTasks.map(task => (
                                <div key={task.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-2">

                                    {/* Image Section */}
                                    {task.image_url && (
                                        <div
                                            className="h-56 w-full relative group cursor-pointer"
                                            onClick={() => setSelectedImage(task.image_url)}
                                        >
                                            <img
                                                src={task.image_url}
                                                alt="Proof"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/20">View Fullscreen</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                                                {task.status || 'Completed'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                                                <Clock size={10} />
                                                {new Date(task.timestamp || task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-200 font-medium leading-relaxed">
                                            {task.task_description || 'Housekeeping service completed.'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 z-10 text-white">
                        <X />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full View"
                        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}

        </div>
    );
};

export default HousekeepingPortal;
