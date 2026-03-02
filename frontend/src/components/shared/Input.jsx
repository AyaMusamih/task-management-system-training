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
    const baseStyle =
        "px-3 py-2 border rounded-xl transition duration-200 focus:outline-none focus:ring-2";

    const stateStyles = error
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-blue-400";

    const disabledStyles = disabled
        ? "bg-gray-100 cursor-not-allowed"
        : "";

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`${baseStyle} ${stateStyles} ${disabledStyles}`}
            />

            {error ? (
                <span className="text-sm text-red-500">{error}</span>
            ) : (
                helperText && (
                    <span className="text-sm text-gray-500">{helperText}</span>
                )
            )}
        </div>
    );
}