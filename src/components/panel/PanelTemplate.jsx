const PanelTemplate = ({ isOpen, children }) => {
  return (
    <div className={`panel-template ${isOpen ? "open" : "closed"}`}>
      <div className="panel-body">{children}</div>
    </div>
  );
};

export default PanelTemplate;
