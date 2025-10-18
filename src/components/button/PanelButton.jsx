const PanelButton = ({ value, onClose, top, disabled = false, active = false, index = 0 }) => {
  const topValue = typeof top === "number" ? `${top}px` : top || "10px";
  let mobileStyle = {};
  try {
    if (typeof window !== "undefined" && window.innerWidth <= 600) {
      const btnSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--button-size-mobile")) || 52;
      const gap = 1200;
      const safe = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safe-area-bottom")) || 0;
      mobileStyle = { position: "fixed", bottom: `${12 + safe + index * (btnSize + gap)}px`, right: "12px" };
    }
  } catch {
    // ignore
  }

  return (
    <button
      className={`panel-button ${active ? "active" : ""}`}
      data-mobile-position
      data-index={index}
      onClick={disabled ? undefined : onClose}
      disabled={disabled}
      style={{
        top: topValue,
        right: "10px",
        zIndex: 1001,
        ...mobileStyle,
      }}
    >
      {value}
    </button>
  );
};

export default PanelButton;
