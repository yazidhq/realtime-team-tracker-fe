import { useGeolocated } from "react-geolocated";
import { useEffect } from "react";
import { CircleMarker, useMap } from "react-leaflet";

const GeoMarker = () => {
  const { coords } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    userDecisionTimeout: 5000,
  });

  const map = useMap();

  useEffect(() => {
    if (coords) {
      const latlng = [coords.latitude, coords.longitude];
      map.setView(latlng, map.getZoom());
    }
  }, [coords, map]);

  if (!coords) return null;

  return (
    <CircleMarker
      center={[coords.latitude, coords.longitude]}
      radius={5}
      pathOptions={{ color: "#000000ff", weight: 1.5, fillColor: "#ff2d55", fillOpacity: 1 }}
    />
  );
};

export default GeoMarker;
