import { LoaderCircle } from 'lucide-react'
import { Check } from 'lucide-react';

const Button = ({
  children,
  page,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  disabledClassName = "",
  success,
  error,
  style
}) => {
  const baseStyle =
    "text-btn-text rounded-full transition duration-200 focus:outline-none";

  const variants = {
    primary: "bg-accent-blue text-white-btn hover:bg-accent-blue/90",
    secondary: "bg-input-bg text-text-primary border border-divider hover:bg-background hover:border-0",
    destructive: "bg-error-dark text-white-btn hover:bg-error-dark/90",
    ghost: "bg-transparent border border-divider text-white-btn hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1 text-hint",
    md: "px-4 py-2 text-field-label",
    lg: "px-6 py-3 text-btn-text",
  };

  const disabledStyles =
    disabled ? `opacity-50 cursor-not-allowed pointer-events-none ${disabledClassName || "bg-input-bg"}` : loading ? "opacity-50 cursor-not-allowed pointer-events-none" : success ? "bg-success-green hover:bg-success-dark" : "";

  return (
    <div className="relative w-full group">
      {disabled && (page === "signup" || page === "login") && (
        <div
          className="
      absolute -top-3 left-1/2 -translate-x-1/2
      bg-accent-indigo text-white-btn text-hint
      px-2 rounded-full whitespace-nowrap
      opacity-0 group-hover:opacity-100
      transition-opacity duration-200
      pointer-events-none
      "
        >
          Fill in all required fields
        </div>
      )}
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
        ${baseStyle}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledStyles}
        ${className}
      `}
        style={style}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-1">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            {children}
          </span>
        ) : success ? (
          <span className="flex items-center justify-center gap-1">
            <Check className="checkmark-icon" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
      {success && page === "signup" && type === "submit" && (
        <p className="text-success-text text-success-green text-center">
          Welcome! Redirecting to Dashboard...
        </p>
      )}
    </div>
  );
}

export default Button;