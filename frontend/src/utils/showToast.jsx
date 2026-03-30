import { toast } from "react-toastify";
import { X } from "lucide-react";

export const showToast = ({
    title,
    description,
    icon,
    type = "success",
}) => {

    const styles = {
        success: {
            border: "border-l-[4px] border-green-500",
            iconBg: "bg-green-500/20 text-green-400",
        },
        error: {
            border: "border-l-[4px] border-red-500",
            iconBg: "bg-red-500/20 text-red-400",
        },
        warning: {
            border: "border-l-[4px] border-yellow-500",
            iconBg: "bg-yellow-500/20 text-yellow-400",
        },
        info: {
            border: "border-l-[4px] border-blue-500",
            iconBg: "bg-blue-500/20 text-blue-400",
        },
    };

    const current = styles[type];

    toast(
        ({ closeToast }) => (
            <div
                className={`
                    flex items-start justify-between gap-4
                    bg-[#0f172a]   
                    text-white
                    rounded-2xl
                    px-5 py-5
                    shadow-[0_15px_40px_rgba(0,0,0,0.6)]
                    ${current.border}
                    mb-5
                `}
            >

                {/* LEFT */}
                <div className="flex items-start justify-start gap-3 w-full">

                    {/* Icon */}
                    <div className={`flex items-center justify-center rounded-full ${current.iconBg}`}>
                        {icon}
                    </div>

                    {/* Text */}
                    <div>
                        <p className="font-semibold text-[15px]">
                            {title}
                        </p>
                        <p className="text-[13px] text-gray-400 mt-1">
                            {description}
                        </p>
                    </div>

                </div>

                {/* Close */}
                <button onClick={closeToast} className="cursor-pointer">
                    <X className="w-5 h-5 text-gray-500 hover:text-white transition" />
                </button>

            </div>
        ),
        {
            style: {
                padding: 0,
                background: "transparent",
                boxShadow: "none",
            },
            bodyStyle: {
                padding: 0,
                margin: 0,
            },
            icon: false,
            hideProgressBar: true,
            closeButton: false,
        }
    );
};