export default function Modal({
    isOpen,
    onClose,
    children,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow-lg w-96"
                onClick={(e) => e.stopPropagation()}
            >

                {children}
            </div>
        </div>
    );
}