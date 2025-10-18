const PanelButton = ({ value, onClose, top }) => {
  const topValue = typeof top === "number" ? `${top}px` : top || "10px";

  return (
    <button
      className="btn position-absolute rounded shadow"
      onClick={onClose}
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
        color: "#1e3a5f",
        fontSize: "20px",
      }}
    >
      {value}
    </button>
  );
};

export default PanelButton;
