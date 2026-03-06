import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    helperText,
    disabled = false,
}) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const baseStyle =
        "px-3 py-2 border rounded-xl transition duration-200 focus:outline-none focus:ring-2 w-full bg-input-bg text-field-typed text-text-filled placeholder:text-text-placeholder";

    const stateStyles = error
        ? "border-error-red focus:ring-error-red"
        : "border-divider focus:ring-accent-blue";

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <div className="flex flex-col gap-1">

            {label && (
                <label className="text-field-label text-text-secondary">
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                <input
                    type={resolvedType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`${baseStyle} ${stateStyles} ${disabledStyles} ${isPassword ? "pr-10" : ""}`}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={disabled}
                        className="absolute right-3 focus:outline-none"
                    >
                        {showPassword
                            ? <EyeOff className="w-5 h-5 text-text-hint hover:text-text-secondary transition" />
                            : <Eye className="w-5 h-5 text-text-hint hover:text-text-secondary transition" />
                        }
                    </button>
                )}
            </div>

            {error ? (
                <span className="text-error-text text-error-red">
                    {helperText || error}
                </span>
            ) : (
                helperText && (
                    <span className="text-hint text-text-hint">
                        {helperText}
                    </span>
                )
            )}

        </div>
    );
}