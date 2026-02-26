export default function Input({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label>{label}</label>}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="px-3 py-2 border rounded-xl"
            />
        </div>
    );
}