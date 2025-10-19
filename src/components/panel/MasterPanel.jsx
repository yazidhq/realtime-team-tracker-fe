import { useAuth } from "../../context/auth/auth-context";
import PanelButton from "../button/PanelButton";
import PanelTemplate from "./PanelTemplate";
import AuthForm from "../auth/AuthForm";
import GroupPanel from "./GroupPanel";
import SettingPanel from "./SettingPanel";
import ProfilePanel from "./ProfilePanel";

const MasterPanel = ({ activePanel, togglePanel }) => {
  const { isAuthenticated } = useAuth();

  const panelButtons = [
    { id: "profile", icon: "👤" },
    { id: "group", icon: "👥" },
    { id: "setting", icon: "⚙️" },
  ];

  return (
    <>
      {panelButtons.map((btn, i) => {
        let panelTop = 10;
        let btnSize = 40;
        let gap = 12;
        try {
          const style = getComputedStyle(document.documentElement);
          panelTop = parseInt(style.getPropertyValue("--panel-top")) || panelTop;
          btnSize = parseInt(style.getPropertyValue("--button-size")) || btnSize;
          gap = parseInt(style.getPropertyValue("--button-gap")) || gap;
        } catch {
          // ignore
        }

        const top = panelTop + i * (btnSize + gap);

        return (
          <PanelButton
            key={btn.id}
            onClose={() => togglePanel(btn.id)}
            value={btn.icon}
            top={top}
            disabled={!isAuthenticated && btn.id !== "profile"}
            active={Boolean(activePanel === btn.id)}
            index={i}
          />
        );
      })}

      <PanelTemplate isOpen={Boolean(activePanel)}>
        {activePanel === "profile" && (
          <div className="p-3" style={{ color: "#1e3a5f" }}>
            {isAuthenticated ? <ProfilePanel /> : <AuthForm />}
          </div>
        )}

        {activePanel === "group" && (
          <div className="p-3" style={{ color: "#1e3a5f" }}>
            <GroupPanel />
          </div>
        )}

        {activePanel === "setting" && (
          <div className="p-3" style={{ color: "#1e3a5f" }}>
            <SettingPanel />
          </div>
        )}
      </PanelTemplate>
    </>
  );
};

export default MasterPanel;
