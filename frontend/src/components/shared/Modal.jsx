const Modal = ({
    isOpen,
    onClose,
    title,
    children,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-[#141b27] text-white p-6 rounded-2xl shadow-lg w-130 transition duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h2 className="text-lg font-semibold mb-4">
                        {title}
                    </h2>
                )}

                {children}
            </div>
        </div>
    );
}
export default Modal;