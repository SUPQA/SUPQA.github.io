import { Coordinate, useMapStore } from '@/models/useMapStore';
import React, { useEffect, useState } from 'react';
import {
  CircleLayer,
  FillLayer,
  Layer,
  LineLayer,
  Marker,
  Popup,
  RasterLayer,
  Source,
  SymbolLayer,
} from 'react-map-gl';
import _ from 'lodash';

const VITE_MAP_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MAIN_COLOR = '#12372A';
interface MakerLayerProps {
  hoverCoord: Coordinate;
  hoverMarker: any;
}

const DataDir = '../data/case3/';

const MakerLayer = (props: MakerLayerProps) => {
  const { hoverCoord, hoverMarker } = props;
  const [lngLat, setlngLat] = useState();
  const [routeData, setRouteData] = useState<any>({});

  const symbolLayer: SymbolLayer = {
    id: 'points',
    type: 'symbol',
    source: 'points',
    layout: {
      'icon-image': 'custom-marker',
      // get the title name from the source's "title" property
      //   "text-field": ["get", "title"],
      //   "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      //   "text-offset": [0, 1.25],
      //   "text-anchor": "top",
    },
  };

  const polygonLayer: FillLayer = {
    id: 'polygons',
    type: 'fill',
    paint: {
      'fill-color': '#CBEEFE',
      'fill-opacity': 0.5,
    },
  };

  const lineLayer: LineLayer = {
    id: 'lines',
    type: 'line',
    paint: {
      'line-color': 'red',
      'line-width': 2,
    },
  };

  const routeDirectLayer: SymbolLayer = {
    id: 'routearrows',
    type: 'symbol',
    layout: {
      'symbol-placement': 'line',
      'text-field': '▶',
      'text-size': ['interpolate', ['linear'], ['zoom'], 12, 24, 22, 60],
      'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 12, 30, 22, 160],
      'text-keep-upright': false,
    },
    paint: {
      'text-color': MAIN_COLOR,
      'text-halo-color': 'hsl(55, 11%, 96%)',
      'text-halo-width': 3,
      'text-opacity': 0.7,
    },
  };

  const routeLayer: LineLayer = {
    id: 'route',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': MAIN_COLOR,
      'line-opacity': 0.8,
      'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 22, 12],
    },
  };

  // api
  const routePlan = async () => {
    let lineGeoJson;
    try {
      const response = await fetch(`${DataDir}line.geojson`);
      lineGeoJson = await response.json();
    } catch (error) {
      console.error('Error fetching JSON data:', error);
    }
    const lineCorrds = lineGeoJson.features[0].geometry.coordinates;
    console.log(lineCorrds);

    const DirectionsUrl =
      'https://api.mapbox.com/directions/v5/mapbox/driving/';
    const OptimizedUrl =
      'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/';

    let routes;
    try {
      const query = await fetch(
        `${OptimizedUrl}${lineCorrds.join(
          ';'
        )}?geometries=geojson&access_token=${VITE_MAP_TOKEN}`
      );
      const json = await query.json();
      // routes = json.routes[0];
      routes = json.trips[0];
      console.log(routes);
    } catch (error) {
      console.error('Error fetching JSON data:', error);
    }

    const route = routes.geometry.coordinates;
    const routeGeojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.slice(0, -1), // 不返回起点
      },
    };
    setRouteData(routeGeojson);
  };

  useEffect(() => {
    routePlan();
  }, []);

  return (
    <>
      <Source type="geojson" data={`${DataDir}polygon.geojson`}>
        <Layer {...polygonLayer} />
      </Source>
      {/* <Source type="geojson" data={`${DataDir}line.geojson`}>
        <Layer {...lineLayer} />
      </Source> */}

      <Source type="geojson" data={routeData}>
        <Layer {...routeLayer} />
        <Layer {...routeDirectLayer} />
      </Source>

      <Source type="geojson" data={`${DataDir}points.geojson`}>
        <Layer {...symbolLayer} />
      </Source>
      {hoverCoord && (
        <Popup
          longitude={hoverCoord?.lng}
          latitude={hoverCoord?.lat}
          anchor="top"
          className="mapPopup"
          closeButton={false}
          offset={[-10, 15] as any}
        >
          <div className="popup">
            <div>
              Coordinate: {hoverCoord?.lng.toFixed(4)}E,
              {hoverCoord?.lat.toFixed(4)}N
            </div>
            <div>name: {hoverMarker?.name}</div>
            <div>class: {hoverMarker?.class}</div>
          </div>
        </Popup>
      )}
    </>
  );
};
export default MakerLayer;
