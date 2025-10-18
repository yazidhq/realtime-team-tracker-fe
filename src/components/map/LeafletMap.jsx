import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import GeoMarker from "./GeoMarker";

const LeafletMap = ({ tileUrl }) => {
  const defaultTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const currentTileUrl = tileUrl || defaultTileUrl;

  return (
    <MapContainer center={[-2.5, 118.0]} zoom={20} style={{ height: "100vh", width: "100%" }} zoomControl={false}>
      <TileLayer key={currentTileUrl} url={currentTileUrl} />
      <GeoMarker />
    </MapContainer>
  );
};

export default LeafletMap;
