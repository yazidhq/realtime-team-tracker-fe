import { useAuth } from "../../context/auth/auth-context";
import PanelButton from "../button/PanelButton";
import PanelTemplate from "./PanelTemplate";
import AuthForm from "../auth/AuthForm";

const MasterPanel = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <PanelButton onClose={onClose} value={"👤"} />
      <PanelTemplate isOpen={isOpen}>
        {isOpen && (
          <div className="p-3" style={{ color: "#1e3a5f" }}>
            {isAuthenticated ? (
              <>
                <h5 className="mb-3">Master Panel</h5>
                <div className="mb-3"></div>
              </>
            ) : (
              <>
                <AuthForm />
              </>
            )}
          </div>
        )}
      </PanelTemplate>
    </>
  );
};

export default MasterPanel;
