import LeafletMap from "../components/map/LeafletMap";
import themes from "../assets/map-themes";
import MasterPanel from "../components/panel/MasterPanel";
import { usePanelToggle } from "../hooks/usePanelToggle";
import ControlButton from "../components/button/ControlButton";
import DefaultRefreshIcon from "../components/icon/RefreshIcon";

const Home = () => {
  const { activePanel, togglePanel } = usePanelToggle(false, 300);

  return (
    <div className="position-relative" style={{ height: "100vh" }}>
      <LeafletMap theme={"streets"} tileUrl={themes.find((t) => t.id === "streets")?.url} />

      <ControlButton
        onClick={async () => {
          try {
            if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map((r) => r.unregister()));
            }

            if (window.caches && caches.keys) {
              const keys = await caches.keys();
              await Promise.all(keys.map((k) => caches.delete(k)));
            }
          } catch (err) {
            console.warn("Refresh: cleanup failed", err);
          }

          window.location.reload();
        }}
        title="Refresh page"
        icon={<DefaultRefreshIcon size={Math.max(12, Math.floor(30 * 0.45))} />}
      />

      <MasterPanel activePanel={activePanel} togglePanel={togglePanel} />
    </div>
  );
};

export default Home;
