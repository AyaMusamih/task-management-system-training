import Button from "../shared/Button";
import { RotateCcw } from "lucide-react";

const Empty = ({
  title = "No data found",
  description,
  icon,
  action,
  className = "",
  onRetry,
  retryLabel = "Clear filters",
  showRetryIcon  = true,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>

      {icon && (
        <img
          src={icon}
          alt="empty"
          className="w-37 mb-5 opacity-70"
        />
      )}

      <p className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </p>

      {description && (
        <p className="text-[#64748B] mb-4 max-w-sm">
          {description}
        </p>
      )}

      {onRetry && (
        <Button
          className="flex gap-2 items-center justify-center px-8 bg-accent-blue text-white rounded-lg hover:bg-blue-400 transition duration-100 cursor-pointer mx-auto"
          onClick={onRetry}
        >
          {showRetryIcon && <RotateCcw className="h-5 w-5" />}
          {retryLabel}
        </Button>
      )}

      {action && action}

    </div>
  );
};

export default Empty;