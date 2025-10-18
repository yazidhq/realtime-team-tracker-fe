import LeafletMap from "../components/map/LeafletMap";
import themes from "../assets/map-themes";

const Home = () => {
  return (
    <div className="position-relative" style={{ height: "100vh" }}>
      <LeafletMap theme={"streets"} tileUrl={themes.find((t) => t.id === "streets")?.url} />
    </div>
  );
};

export default Home;
