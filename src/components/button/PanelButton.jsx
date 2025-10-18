const PanelButton = ({ value, onClose, top, disabled = false, active = false }) => {
  const topValue = typeof top === "number" ? `${top}px` : top || "10px";

  return (
    <button
      className="btn position-absolute rounded shadow"
      onClick={disabled ? undefined : onClose}
      disabled={disabled}
      style={{
        top: topValue,
        right: "10px",
        zIndex: 1001,
        width: "40px",
        height: "40px",
        padding: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        color: "white",
        fontSize: "20px",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
        border: active ? "1px solid #000" : "none",
        boxSizing: "border-box",
      }}
    >
      {value}
    </button>
  );
};

export default PanelButton;
