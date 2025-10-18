const PanelTemplate = ({ isOpen, children }) => {
  return (
    <div
      className="position-absolute top-0 end-0 rounded shadow transition"
      style={{
        width: isOpen ? "320px" : "0px",
        height: "calc(100vh - 20px)",
        marginTop: "10px",
        marginRight: isOpen ? "60px" : "16px",
        zIndex: 1000,
        transition: "all 0.3s ease",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {children}
    </div>
  );
};

export default PanelTemplate;
