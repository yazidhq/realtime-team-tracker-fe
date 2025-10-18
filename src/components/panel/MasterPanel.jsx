import { useAuth } from "../../context/auth/auth-context";
import PanelButton from "../button/PanelButton";
import PanelTemplate from "./PanelTemplate";
import AuthForm from "../auth/AuthForm";

const MasterPanel = ({ activePanel, togglePanel }) => {
  const { isAuthenticated } = useAuth();

  const panelButtons = [
    { id: "profile", icon: "👤" },
    { id: "group", icon: "👥" },
  ];

  return (
    <>
      {panelButtons.map((btn, i) => (
        <PanelButton
          key={btn.id}
          onClose={() => togglePanel(btn.id)}
          value={btn.icon}
          top={10 + i * 50}
          disabled={!isAuthenticated && btn.id !== "profile"}
          active={activePanel === btn.id}
        />
      ))}

      <PanelTemplate isOpen={Boolean(activePanel)}>
        {activePanel === "profile" && (
          <div className="p-3" style={{ color: "#1e3a5f" }}>
            {isAuthenticated ? (
              <>
                <h5 className="mb-3">Profile</h5>
                <div className="mb-3">Welcome back.</div>
              </>
            ) : (
              <AuthForm />
            )}
          </div>
        )}

        {activePanel === "group" && (
          <div className="p-3" style={{ color: "#1e3a5f" }}>
            <h5 className="mb-3">Group</h5>
            <div className="mb-3">Theme and settings go here.</div>
          </div>
        )}
      </PanelTemplate>
    </>
  );
};

export default MasterPanel;
