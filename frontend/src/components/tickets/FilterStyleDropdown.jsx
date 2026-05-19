import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const FilterStyleDropdown = ({ label, staticLabel, options, value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { if (!disabled) setOpen((v) => !v); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-hint transition-colors duration-150 bg-[#6B7280]/10 cursor-pointer
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    text-[#9CA3AF]`}
            >
                {staticLabel && (
                    <span>{staticLabel}: </span>
                )}
                <span className={staticLabel ? "font-semibold text-text-primary" : ""} style={staticLabel ? { fontFamily: 'Inter' } : {}}>
                    {selected?.label ?? label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {open && !disabled && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-input-bg border border-divider/50 rounded-lg py-1 min-w-40 shadow-xl max-h-48 overflow-y-auto
                    [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-input-bg [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {options?.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-hint hover:bg-white/5 cursor-pointer
                                ${value === opt.value ? "text-accent-blue" : "text-text-secondary"}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterStyleDropdown;