import LeafletMap from "../components/map/LeafletMap";

const Home = () => {
  const themes = [
    {
      id: "satellite",
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/16",
    },
    {
      id: "streets",
      name: "Streets",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      preview: "https://tile.openstreetmap.org/5/16/10.png",
    },
    {
      id: "dark",
      name: "Dark",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      preview: "https://a.basemaps.cartocdn.com/dark_all/5/16/10.png",
    },
    {
      id: "light",
      name: "Light",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      preview: "https://a.basemaps.cartocdn.com/light_all/5/16/10.png",
    },
    {
      id: "topo",
      name: "Topographic",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      preview: "https://a.tile.opentopomap.org/5/16/10.png",
    },
  ];

  return (
    <div className="position-relative" style={{ height: "100vh" }}>
      <LeafletMap theme={"streets"} tileUrl={themes.find((t) => t.id === "streets")?.url} />
    </div>
  );
};

export default Home;
