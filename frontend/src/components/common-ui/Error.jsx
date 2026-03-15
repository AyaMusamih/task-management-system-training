import Button from "../shared/Button";

const Error = ({
    title = "Something went wrong",
    description,
    icon,
    onRetry,
    className = "",
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>

            {icon && (
                <img
                    src={icon}
                    alt="error"
                    className="w-25 mb-6"
                />
            )}

            <p className="text-lg font-semibold text-text-primary mb-2">
                {title}
            </p>

            {description && (
                <p className="text-[#64748B] mb-6">
                    {description}
                </p>
            )}

            {onRetry && (
                <Button
                    className="px-8 bg-accent-blue text-white rounded-lg hover:bg-blue-400 transition duration-100 cursor-pointer"
                    onClick={onRetry}>
                    Retry
                </Button>
            )}

        </div>
    );
};

export default Error;