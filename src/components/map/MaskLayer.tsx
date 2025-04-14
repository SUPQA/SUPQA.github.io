import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl';
import type { CircleLayer, FillLayer, LineLayer } from 'react-map-gl';
import { GEOTYPE, useMaskerStore } from '@/models/useMaskerStore';
import * as turf from '@turf/turf';
import { useMapStore } from '@/models/useMapStore';

const CircleBorderLayer: LineLayer = {
  id: 'circle-border',
  type: 'line',
  source: 'circle-data',
  layout: {},
  paint: {
    'line-color': '#000000',
    'line-width': 2,
    'line-dasharray': [2, 2], // 实线4px，空隙2px
  },
};

const CircleBorderSelectLayer: LineLayer = {
  id: 'circle-border-select',
  type: 'line',
  source: 'select-circle-data',
  layout: {},
  paint: {
    'line-color': '#12372a',
    'line-width': 4,
  },
};

const MaskLayer = (props: any) => {
  const [selectCircleGeo, setSelectCircleGeo] = useState<GeoJSON.Feature>();
  const [circleFeatures, setCircleFeatures] = useState<GeoJSON.Feature[]>([]);
  const [combCircleCoord, setCombCircleCoord] = useState([]);
  const { circleList, selectCircle, maskerType, customFeatures } =
    useMaskerStore();
  const { map } = useMapStore();

  const getMasksLayer = useMemo<any>(() => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-180, -90],
                [180, -90],
                [180, 90],
                [-180, 90],
                [-180, -90],
              ],
              // Hollow Mask
              ...combCircleCoord,
            ],
          },
        },
      ],
    };
  }, [combCircleCoord]);

  const getBorderLayer = useMemo<any>(() => {
    return {
      type: 'FeatureCollection',
      features: circleFeatures,
    };
  }, [circleFeatures]);

  const FullScreenLayer: FillLayer = useMemo(
    () => ({
      id: 'full-screen-mask',
      type: 'fill',
      source: 'mask-data',
      layout: {},
      paint: {
        'fill-color': 'rgba(0, 0, 0, 1)', // 完全不透明的黑色遮罩
        'fill-opacity': circleFeatures.length > 0 ? 0.3 : 0,
      },
    }),
    [circleFeatures]
  );

  useEffect(() => {
    if (!circleList) return;
    const circles = circleList.map((cl) => {
      return turf.circle(cl.centroid, cl.radius, {
        steps: 64,
        units: 'meters',
      });
    });

    if (circles.length === 0) return;
    const customs = customFeatures.map((item) => turf.feature(item));
    const multipleCirclesFeatures = turf.featureCollection([
      ...circles,
      ...customs,
    ]);
    let combinedGeometry =
      circles.length > 1 ? turf.union(multipleCirclesFeatures) : circles[0];

    setCircleFeatures(circles);
    setCombCircleCoord(
      circles.length > 1
        ? combinedGeometry.geometry.coordinates.map((item) => item[0])
        : combinedGeometry.geometry.coordinates
    );

    const bounds = turf.bbox(combinedGeometry);
    map.fitBounds(bounds, {
      padding: 100,
      maxZoom: 13.5,
      duration: 1000,
      offset: [0, -50],
    });
  }, [circleList, customFeatures]);

  useEffect(() => {
    if (!selectCircle) return;
    const genGeo = turf.circle(selectCircle.centroid, selectCircle.radius, {
      steps: 64,
      units: 'meters',
    });
    setSelectCircleGeo(genGeo);
  }, [selectCircle]);

  return (
    maskerType === GEOTYPE.Community && (
      <>
        <Source id="mask-data" type="geojson" data={getMasksLayer}>
          <Layer {...FullScreenLayer} />
        </Source>
        <Source id="circle-data" type="geojson" data={getBorderLayer}>
          <Layer {...CircleBorderLayer} />
        </Source>
        {selectCircle && (
          <Source id="select-circle-data" type="geojson" data={selectCircleGeo}>
            <Layer {...CircleBorderSelectLayer} />
          </Source>
        )}
      </>
    )
  );
};
export default MaskLayer;
