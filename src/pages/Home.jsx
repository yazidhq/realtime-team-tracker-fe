import LeafletMap from "../components/map/LeafletMap";
import themes from "../assets/map-themes";
import MasterPanel from "../components/panel/MasterPanel";
import { usePanelToggle } from "../hooks/usePanelToggle";
import { useAuth } from "../context/auth/auth-context";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { activePanel, togglePanel } = usePanelToggle(isAuthenticated, 300);

  return (
    <div className="position-relative" style={{ height: "100vh" }}>
      <LeafletMap theme={"streets"} tileUrl={themes.find((t) => t.id === "streets")?.url} />

      <MasterPanel activePanel={activePanel} togglePanel={togglePanel} />
    </div>
  );
};

export default Home;
