import { useAuth } from "../../context/auth/auth-context";
import PanelButton from "../button/PanelButton";
import PanelTemplate from "./PanelTemplate";
import AuthForm from "../auth/AuthForm";
import { CapitalizeFirstLetter } from "../../helpers/capitalized";
import Logout from "../auth/Logout";

const MasterPanel = ({ activePanel, togglePanel }) => {
  const { user, isAuthenticated } = useAuth();

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
            {isAuthenticated ? (
              <>
                <div className="d-flex justify-content-center mb-3">
                  <lottie-player
                    src="https://assets10.lottiefiles.com/packages/lf20_myejiggj.json"
                    background="transparent"
                    speed="1"
                    style={{ width: "min(60vw, 300px)", height: "auto" }}
                    loop
                    autoplay
                  ></lottie-player>
                </div>
                <div className="mb-3 fw-bold text-center fs-4">Welcome back, {CapitalizeFirstLetter(user.name)}</div>
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

        {activePanel === "setting" && (
          <div className="p-3" style={{ color: "#1e3a5f" }}>
            <h5 className="mb-3">Settings</h5>

            <Logout />
          </div>
        )}
      </PanelTemplate>
    </>
  );
};

export default MasterPanel;
