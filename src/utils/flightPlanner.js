import * as turf from "@turf/turf";

/**
 * Генерация маршрута облёта внутри полигона с основными и опорными трассами.
 * @param {Array} polygonPoints - Массив [{lng, lat}]
 * @param {number} spacingMeters - Расстояние между основными линиями (в метрах)
 * @param {object} settings - Параметры: { altitude, followTerrain, crossCount }
 * @returns {Array} массив точек маршрута
 */
export function generateFlightLinesInsidePolygon(polygonPoints, spacingMeters, settings) {
  const coords = polygonPoints.map(p => [p.lng, p.lat]);
  coords.push([polygonPoints[0].lng, polygonPoints[0].lat]); // замыкаем

  const polygon = turf.polygon([coords]);
  const centroid = turf.centroid(polygon).geometry.coordinates;

  // Перевод метров в градусы
  const metersToDegrees = (meters, latitude) => {
    const latDeg = meters / 111320;
    const lonDeg = meters / (111320 * Math.cos(latitude * Math.PI / 180));
    return [latDeg, lonDeg];
  };

  const [lineSpacingLat, lineSpacingLng] = metersToDegrees(spacingMeters, centroid[1]);

  const bbox = turf.bbox(polygon);
  const extentX = bbox[2] - bbox[0];
  const extentY = bbox[3] - bbox[1];

  const angle = turf.bearing(turf.centroid(polygon), turf.centroid(turf.bboxPolygon(bbox)));

  // 🔷 Основные линии (вертикальные)
  const numLines = Math.ceil(extentX / lineSpacingLng);
  const baseLines = [];

  for (let i = 0; i <= numLines; i++) {
    const x = bbox[0] + i * lineSpacingLng;
    const line = turf.lineString([[x, bbox[1]], [x, bbox[3]]]);
    baseLines.push(line);
  }

  const rotatedLines = baseLines.map(line =>
    turf.transformRotate(line, angle, { pivot: centroid })
  );

  const mainSegments = rotatedLines
    .map(line => turf.lineSplit(line, polygon))
    .flatMap(coll =>
      coll.features.filter(f =>
        turf.booleanWithin(turf.midpoint(f.geometry.coordinates[0], f.geometry.coordinates[1]), polygon)
      )
    );

  // 🔷 Опорные трассы (перпендикулярные)
  const crossSegments = [];
  const crossCount = settings.crossCount || 0;
  if (crossCount > 0) {
    const crossSpacing = extentY / (crossCount + 1);
    for (let i = 1; i <= crossCount; i++) {
      const y = bbox[1] + i * crossSpacing;
      const line = turf.lineString([[bbox[0], y], [bbox[2], y]]);
      const rotatedLine = turf.transformRotate(line, angle, { pivot: centroid });

      const pieces = turf.lineSplit(rotatedLine, polygon);
      const valid = pieces.features.filter(f =>
        turf.booleanWithin(turf.midpoint(f.geometry.coordinates[0], f.geometry.coordinates[1]), polygon)
      );

      crossSegments.push(...valid);
    }
  }

  // 🔷 Формирование маршрута змейкой
  const allSegments = [...mainSegments, ...crossSegments];
  const waypoints = [];

  allSegments.forEach((segment, idx) => {
    const coords = segment.geometry.coordinates;
    const [start, end] = idx % 2 === 0 ? coords : coords.slice().reverse();

    waypoints.push({
      lng: start[0],
      lat: start[1],
      alt: settings.altitude ?? 50,
      followTerrain: settings.followTerrain ?? false,
    });
    waypoints.push({
      lng: end[0],
      lat: end[1],
      alt: settings.altitude ?? 50,
      followTerrain: settings.followTerrain ?? false,
    });
  });

  return waypoints;
}
