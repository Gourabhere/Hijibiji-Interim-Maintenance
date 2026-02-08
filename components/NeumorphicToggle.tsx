
import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface Props {
    isChecked: boolean;
    onChange: (checked: boolean) => void;
}

const NeumorphicToggle: React.FC<Props> = ({ isChecked, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={isChecked}
                onChange={(e) => onChange(e.target.checked)}
            />
            {/* Track */}
            <div className="w-20 h-10 bg-[var(--bg-deep)] rounded-full peer neo-inset relative transition-all duration-300 border border-[var(--border-subtle)]">
                {/* Knock/Thumb */}
                <div className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-[var(--bg-deep)] neo-button hover:!translate-y-0 transition-all duration-300 flex items-center justify-center text-[var(--text-muted)] ${isChecked ? 'translate-x-10 text-cyan-400' : 'translate-x-0'}`}>
                    {isChecked ? <Sun size={14} className="pointer-events-none" /> : <Moon size={14} className="pointer-events-none" />}
                </div>
            </div>
        </label>
    );
};

export default NeumorphicToggle;
