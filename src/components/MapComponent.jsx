import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapComponent.css";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapComponent = forwardRef(({ selectedStyle, onMouseMoveСord, isTerrainOn, 
  isWaypointMode, waypoints, setWaypoints, waypointHeight, followTerrain,
  isPolygonMode, polygons, currentPolygon, setCurrentPolygon, setSelectedPolygonIndex, setIsPolygonMode}, ref) => {
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mouseMoveHandlerRef = useRef(null);
  const isDragging = useRef(false);

  const [cameraState, setCameraState] = useState({
    center: [37.618423, 55.751244], // Москва
    zoom: 10,
    pitch: 45,
    bearing: 0,
  });


  const polygonClickHandlersRef = useRef({});






const renderPolygons = () => {
  console.log("🔁 renderPolygons called");
  const map = mapRef.current;
  if (!map || !mapIsLoaded) return;

  // Удаление старых слоёв и обработчиков
  map.getStyle().layers?.forEach((layer) => {
    if (layer.id.startsWith("polygon-fill-")) {
      const handler = polygonClickHandlersRef.current[layer.id];
      if (handler) {
        map.off("click", layer.id, handler);
        delete polygonClickHandlersRef.current[layer.id];
      }
      map.removeLayer(layer.id);
    }

    if (layer.id.startsWith("polygon-outline-")) {
      map.removeLayer(layer.id);
    }
  });

  Object.keys(map.getStyle().sources).forEach(sourceId => {
    if (sourceId.startsWith("polygon-")) {
      map.removeSource(sourceId);
    }
  });

  const allPolygons = [...polygons, ...(currentPolygon.length >= 2 ? [currentPolygon] : [])];

  allPolygons.forEach((polygon, index) => {
    const coords = [...polygon.map(p => [p.lng, p.lat]), [polygon[0].lng, polygon[0].lat]];
    const sourceId = `polygon-${index}`;
    const fillLayerId = `polygon-fill-${index}`;
    const outlineLayerId = `polygon-outline-${index}`;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coords]
        }
      }
    });

    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": "#088",
        "fill-opacity": 0.05
      }
    });
    console.log("✅ Добавлен слой:", fillLayerId);
    map.addLayer({
      id: outlineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#088",
        "line-width": 2
      }
    });

    const clickHandler = () => {
      console.log(`🟢 Клик по полигону #${index}`);
      if (isPolygonMode) {
        setIsPolygonMode(false)
        setSelectedPolygonIndex(index);
      }
    };

    map.on("click", fillLayerId, clickHandler);
    polygonClickHandlersRef.current[fillLayerId] = clickHandler;
  });
};


  const renderWaypoints = () => {
  const map = mapRef.current;
  if (!map || !mapIsLoaded) return;

  // ❌ ВСЕГДА удаляем старые данные
  if (map.getLayer("waypoints-line")) map.removeLayer("waypoints-line");
  if (map.getSource("waypoints")) map.removeSource("waypoints");

  if (map._waypointMarkers) {
    map._waypointMarkers.forEach((m) => m.remove());
  }
  map._waypointMarkers = [];

  // ✅ Если нет точек — больше ничего не делаем
  if (waypoints.length === 0) return;

  // Добавляем новые
  const coords = waypoints.map((wp) => [wp.lng, wp.lat]);

  map.addSource("waypoints", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords }
        }
      ]
    }
  });

  map.addLayer({
    id: "waypoints-line",
    type: "line",
    source: "waypoints",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff0000", "line-width": 2 }
  });

  map._waypointMarkers = coords.map((coord, index) =>
    new mapboxgl.Marker({ color: "red" })
      .setLngLat(coord)
      .setPopup(new mapboxgl.Popup().setText(`WP${index + 1}`))
      .addTo(map)
  );
};
  
  useImperativeHandle(ref, () => ({
      forceRenderWaypoints: renderWaypoints
      }));
  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN) {
      console.error("❌ API-токен Mapbox не найден! Проверь .env");
      return;
    }

    if (!mapContainerRef.current) {
      console.error("❌ Контейнер для карты не найден!");
      return;
    }

    if (mapRef.current) {
      console.warn("⚠️ Обновляем стиль карты без сброса камеры...");
      setMapIsLoaded(false);
      mapRef.current.setStyle(selectedStyle);
      return;
    }

    console.log("✅ Инициализация карты...");
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: selectedStyle,
      center: cameraState.center,
      zoom: cameraState.zoom,
      pitch: cameraState.pitch,
      bearing: cameraState.bearing,
      projection: "globe",
    });

    mapRef.current = map;

    map.dragPan.disable();
    map.addControl(new mapboxgl.NavigationControl());

    map.on("load", () => {
      setMapIsLoaded(true);
      console.log("✅ Карта загружена!");

      if (isTerrainOn) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 5 });
      }

      map.setLayoutProperty("country-label", "text-field", ["get", "name_ru"]);
      map.setLayoutProperty("state-label", "text-field", ["get", "name_ru"]);
      map.setLayoutProperty("settlement-label", "text-field", ["get", "name_ru"]);
      renderWaypoints(); 
    });
    

   

    map.on("moveend", () => {
      setCameraState({
        center: map.getCenter().toArray(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    });

    const onMouseDown = (e) => {
      if (e.button === 1) {
        isDragging.current = true;
        map.getCanvas().style.cursor = "grabbing";
      }
    };

    const onMouseMove = (e) => {
      if (isDragging.current) {
        map.panBy([-e.movementX, -e.movementY], { animate: false });
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      map.getCanvas().style.cursor = "";
    };

    map.getCanvas().addEventListener("mousedown", onMouseDown);
    map.getCanvas().addEventListener("mousemove", onMouseMove);
    map.getCanvas().addEventListener("mouseup", onMouseUp);
    map.getCanvas().addEventListener("mouseleave", onMouseUp);

    mouseMoveHandlerRef.current = (event) => {
      if (!isDragging.current && event?.lngLat) {
        onMouseMoveСord({
          lng: event.lngLat.lng.toFixed(4),
          lat: event.lngLat.lat.toFixed(4),
        });
      }
    };
    map.on("mousemove", mouseMoveHandlerRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("mousemove", mouseMoveHandlerRef.current);
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (mapContainerRef.current) {
        const canvas = mapContainerRef.current.querySelector("canvas");
        if (canvas) {
          canvas.removeEventListener("mousedown", onMouseDown);
          canvas.removeEventListener("mousemove", onMouseMove);
          canvas.removeEventListener("mouseup", onMouseUp);
          canvas.removeEventListener("mouseleave", onMouseUp);
        }
      }
    };
  }, [selectedStyle, isTerrainOn]);

  useEffect(() => {
  if (mapIsLoaded) {
    renderWaypoints();
  }
    }, [waypoints.length, mapIsLoaded]); // 

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapIsLoaded) return;

    const handleClick = (e) => {
      if (!isWaypointMode) return;

      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      const newPoint = {
        lng,
        lat,
        alt: waypointHeight,
        followTerrain
      };

      setWaypoints((prev) => [...prev, newPoint]);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [isWaypointMode, waypointHeight, followTerrain, mapIsLoaded]);


  useEffect(() => {
  const map = mapRef.current;
  if (!map || !mapIsLoaded) return;

  const handleClick = (e) => {
    if (!isPolygonMode) return;

    const { lng, lat } = e.lngLat;
    setCurrentPolygon((prev) => [...prev, { lng, lat }]);
  };

  map.on("click", handleClick);
  return () => map.off("click", handleClick);
}, [isPolygonMode, mapIsLoaded]);

useEffect(() => {
  if (mapIsLoaded) {
    renderPolygons();
  }
}, [polygons, currentPolygon, mapIsLoaded]);


  return <div id="map-container" ref={mapContainerRef} />;
});

export default MapComponent;