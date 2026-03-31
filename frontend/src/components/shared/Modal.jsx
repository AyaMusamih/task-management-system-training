import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
}) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-4"
            onClick={onClose}
        >
            <div
                className="relative border border-divider/30 shadow-2xl flex flex-col overflow-hidden
                w-[500px] max-w-[95vw]
                h-[859px] max-h-[90vh]"
                style={{ borderRadius: "18px" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-background shrink-0 h-12 px-4 flex items-center justify-between">
                    {title && (
                        <h2 className="font-inter font-meduim text-[20px] text-text-primary">
                            {title}
                        </h2>
                    )}
                    <button
                        onClick={onClose}
                        className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-text-hint hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body*/}
                <div
                    className="overflow-y-auto overflow-x-hidden custom-scrollba flex-1 px-8 py-6"
                    style={{ backgroundColor: "#191D23" }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;