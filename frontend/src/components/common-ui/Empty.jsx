import React from "react";

const Empty = ({
  title = "No data found",
  description,
  icon,
  action,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      
      {icon && (
        <img
          src={icon}
          alt="empty"
          className="w-24 mb-6 opacity-70"
        />
      )}

      <p className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </p>

      {description && (
        <p className="text-text-secondary mb-4 max-w-sm">
          {description}
        </p>
      )}

      {action && action}
      
    </div>
  );
};

export default Empty;