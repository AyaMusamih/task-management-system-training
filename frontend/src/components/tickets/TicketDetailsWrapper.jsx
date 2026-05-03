import { useEffect } from "react";
import { X } from "lucide-react";

const TicketDetailsWrapper = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-4"
            onClick={onClose}
        >
            <div
                className="relative border border-divider/30 shadow-2xl flex flex-col overflow-hidden"
                style={{ borderRadius: "18px", width: "900px", maxWidth: "95vw", height: "751px", maxHeight: "90vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-card-left shrink-0 h-12 px-4 flex items-center justify-between border-b border-divider/20">
                    <h2 className="font-inter font-medium text-[20px] text-text-primary">Ticket Details</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-hint hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 overflow-hidden bg-background">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default TicketDetailsWrapper;