export default function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  className = "",
}) {
  const baseStyle = "px-4 py-2 rounded-xl font-medium transition duration-200";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}