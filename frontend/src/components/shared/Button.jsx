export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}) {
  const baseStyle =
    "text-btn-text rounded-full transition duration-200 focus:outline-none";

  const variants = {
    primary: "bg-accent-blue text-white-btn hover:bg-accent-blue/90",
    secondary: "bg-input-bg text-text-primary border border-divider hover:bg-white/5",
    destructive: "bg-error-dark text-white-btn hover:bg-error-dark/90",
    ghost: "bg-transparent border border-divider text-white-btn hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1 text-hint",
    md: "px-4 py-2 text-field-label",
    lg: "px-6 py-3 text-btn-text",
  };

  const disabledStyles =
    disabled || loading ? "bg-input-bg opacity-50 cursor-not-allowed pointer-events-none" : "";

  return (
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
    >
      {children}
    </button>
  );
}