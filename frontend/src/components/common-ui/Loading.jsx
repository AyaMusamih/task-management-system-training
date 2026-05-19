import React from "react";

const Loading = ({
    variant = "spinner",
    rows = 6,
    message = "Loading...",
    className = "",
}) => {

    if (variant === "skeleton") {
        return (
            <div className={`flex flex-col justify-center space-y-2 py-2${className}`}>
                {Array.from({ length: rows })?.map((_, index) => (
                    <div
                        key={index}
                        className="h-10 skeleton rounded-md"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center min-h-75 text-center ${className}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent-blue mb-4"></div>
            <p className="text-text-secondary">{message}</p>
        </div>
    );
};

export default Loading;