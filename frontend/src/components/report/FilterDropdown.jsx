import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react";

const FilterDropdown = ({ label, options, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-hint transition-colors duration-150 bg-[#6B7280]/10 cursor-pointer
                    ${value ? "text-accent-blue" : "text-[#9CA3AF]"}`}
            >
                <span>{label}</span>
                {value && <span className="text-hint opacity-70">: {value}</span>}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {open && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-input-bg border border-divider/50 rounded-lg py-1 min-w-36 shadow-xl">
                    <button
                        onClick={() => { onChange(""); setOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-hint text-text-hint hover:bg-white/5 cursor-pointer"
                    >
                        All
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.value ?? opt}
                            onClick={() => { onChange(opt.value ?? opt); setOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-hint hover:bg-white/5 cursor-pointer
                                ${value === (opt.label ?? opt) ? "text-accent-blue" : "text-text-secondary"}`}
                        >
                            {opt.label ?? (opt.charAt(0) + opt.slice(1).toLowerCase())}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
export default FilterDropdown;