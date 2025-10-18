import LeafletMap from "../components/map/LeafletMap";
import themes from "../assets/map-themes";
import { useState } from "react";
import MasterPanel from "../components/panel/MasterPanel";

const Home = () => {
  const [activePanel, setActivePanel] = useState(null);

  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  return (
    <div className="position-relative" style={{ height: "100vh" }}>
      <LeafletMap theme={"streets"} tileUrl={themes.find((t) => t.id === "streets")?.url} />

      <MasterPanel isOpen={activePanel !== "masterPanel"} onClose={() => togglePanel("masterPanel")} />
    </div>
  );
};

export default Home;
