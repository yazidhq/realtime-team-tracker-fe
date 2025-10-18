import { forwardRef, useCallback } from "react";

const ControlButton = forwardRef(({ onClick, title = "Refresh", icon = null, disabled = false, className = "" }, ref) => {
  const handleClick = useCallback(
    (e) => {
      if (disabled) return;
      onClick && onClick(e);
    },
    [onClick, disabled]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick && onClick(e);
      }
    },
    [onClick, disabled]
  );

  return (
    <button
      ref={ref}
      className={`control-button ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={title}
      aria-label={title}
      type="button"
      disabled={disabled}
    >
      {icon}
    </button>
  );
});

export default ControlButton;
