const PanelButton = ({ value, onClose }) => {
  return (
    <button
      className="btn position-absolute rounded shadow"
      onClick={onClose}
      style={{
        top: "10px",
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
      }}
    >
      {value}
    </button>
  );
};

export default PanelButton;
