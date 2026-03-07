import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CircleAlert, Check } from 'lucide-react';

export default function Input({
    label,
    type = "text",
    value,
    checked,
    name,
    onChange,
    placeholder,
    error,
    success,
    helperText,
    disabled = false,
    className = "",
}) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const isCheckbox = type === "checkbox";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const borderColor = error
        ? "border-error-red focus:border-error-red focus:ring-1 focus:ring-error-red"
        : success
            ? "border-success-green focus:border-success-green focus:ring-1 focus:ring-success-green"
            : "border-divider focus:border-accent-blue focus:ring-1 focus:ring-accent-blue";

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <div className="flex flex-col gap-1 mb-2.5">

            {/* Label */}
            {label && !isCheckbox && (
                <label className="text-field-label text-text-secondary mb-1">
                    {label}{'*'}
                </label>
            )}

            {/* Checkbox */}
            {isCheckbox ? (
                <div className="flex items-start gap-2.5">
                    <div className="relative flex items-center justify-center mt-0.5">
                        <input
                            type="checkbox"
                            name={name}
                            onChange={onChange}
                            checked={checked}
                            disabled={disabled}
                            className="peer sr-only"
                        />

                        <div
                            onClick={!disabled ? onChange : undefined}
                            className={`checkbox border-2 flex items-center justify-center cursor-pointer transition-all duration-200
                                ${checked
                                    ? success
                                        ? "bg-success-green border-success-green"
                                        : "bg-accent-blue border-accent-blue"
                                    : "bg-transparent border-divider"
                                }
                                ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {checked && (
                                <Check className="w-12 h-12 text-white-btn stroke-3"/>
                            )}
                        </div>
                    </div>

                    {label && (
                        <label
                            className="text-checkbox text-text-secondary cursor-pointer select-none"
                            onClick={!disabled ? onChange : undefined}
                        >
                            {label}
                        </label>
                    )}
                </div>
            ) : (
                /* Text / Password */
                <div className="relative">
                    <input
                        type={inputType}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`input-field text-field-typed text-text-filled text-field-placeholder placeholder:text-text-placeholder bg-input-bg border outline-none transition-all duration-200 ${borderColor} ${disabledStyles} ${isPassword ? "pr-12" : ""} ${className}`}
                    />

                    {/* Toggle password */}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled={disabled}
                            className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none"
                        >
                            {showPassword ? (
                                <Eye className="password-eye-icon text-text-hint hover:text-text-secondary transition" />
                            ) : (
                                <EyeOff className="password-eye-icon text-text-hint hover:text-text-secondary transition" />
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Error / helperText */}
            {error ? (
                <div className="flex items-center gap-1 mt-1">
                    < CircleAlert className="error-icon text-error-red" />
                    <span className="text-error-text text-error-red">
                        {error}
                    </span>
                </div>
            ) : (
                helperText && (
                    <span className="text-hint text-text-hint mt-0.5 mb-2">
                        {helperText}
                    </span>
                )
            )}
        </div>
    );
}