import { useGeolocated } from "react-geolocated";
import { useEffect, useRef, useState } from "react";
import { CircleMarker, useMap } from "react-leaflet";

const GeoMarker = () => {
  const { coords } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    watchPosition: true,
    userDecisionTimeout: 5000,
  });

  const map = useMap();

  const centeredRef = useRef(false);
  const [polledCoords, setPolledCoords] = useState(null);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    let mounted = true;

    const poll = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted || !pos || !pos.coords) return;
          setPolledCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, heading: pos.coords.heading });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0, timeout: 2000 }
      );
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!map || !navigator?.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!pos || !pos.coords) return;
        if (centeredRef.current) return;

        const latlng = [pos.coords.latitude, pos.coords.longitude];

        try {
          map.invalidateSize();
        } catch {
          // ignore
        }

        const preferredZoom = Math.max(map.getZoom(), 16);
        map.setView(latlng, preferredZoom);
        centeredRef.current = true;
      },
      () => {},
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 60000 }
    );
  }, [map]);

  const haversine = (a, b) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);

    const sinDlat = Math.sin(dLat / 2);
    const sinDlon = Math.sin(dLon / 2);
    const aa = sinDlat * sinDlat + sinDlon * sinDlon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  useEffect(() => {
    const source = polledCoords || coords;
    if (source && map) {
      const latlng = [source.latitude, source.longitude];

      const center = map.getCenter();
      const dist = haversine([center.lat, center.lng], [source.latitude, source.longitude]);

      if (!centeredRef.current || dist > 25) {
        const preferredZoom = Math.max(map.getZoom(), 16);
        map.setView(latlng, preferredZoom);
        centeredRef.current = true;
      }
    }
  }, [polledCoords, coords, map]);

  const display = polledCoords || coords;
  if (!display) return null;

  return (
    <CircleMarker
      center={[display.latitude, display.longitude]}
      radius={5}
      pathOptions={{ color: "#000000ff", weight: 1.5, fillColor: "#ff2d55", fillOpacity: 1 }}
    />
  );
};

export default GeoMarker;
