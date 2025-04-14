import { useMapStore } from '@/models/useMapStore';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import districtData from '../../../public/data/district.json';
import { Layer, FillLayer, Source, Popup } from 'react-map-gl';
import chroma from 'chroma-js';
import { LineLayer } from 'mapbox-gl';
import { getDistrictArea } from '@/apis';
import { GEOTYPE, useMaskerStore } from '@/models/useMaskerStore';

const COLOR_SCALE = ['#E2F0D9', '#385723'];

const ProvinceLayer = (props) => {
  const { id, popup } = props;
  // const [data, setData] = useState<any>();
  // const [colorDomain, setColorDomain] = useState([0, 100]);
  const { maskerType, districtArea } = useMaskerStore();
  const { map } = useMapStore();

  const fillLayer: FillLayer = useMemo(() => {
    let colorInterpolate = chroma.scale(COLOR_SCALE).domain([0, 100]);
    let fillColors = [];

    if (districtArea) {
      const values = Object.values(districtArea);
      const colorDomain = [Math.min(...values), Math.max(...values)];
      colorInterpolate = chroma.scale(COLOR_SCALE).domain(colorDomain);

      fillColors = Object.keys(districtArea)?.reduce((acc, key) => {
        return [
          ...acc,
          parseInt(key),
          colorInterpolate(districtArea[key]).hex(),
        ];
      }, []);
    }

    return {
      id: id,
      source: id,
      type: 'fill',
      paint: {
        'fill-color': districtArea
          ? [
              'match',
              ['get', 'adcode'], //在geojson中获取adcode属性,color mapping
              ...fillColors,
              'transparent', // 默认颜色
            ]
          : 'transparent',
        'fill-opacity': maskerType === GEOTYPE.District ? 0.9 : 0,
      },
    };
  }, [districtArea, maskerType]);

  const borderLayer: LineLayer = {
    id: 'borderLayer',
    type: 'line',
    source: id,
    paint: {
      'line-color': '#000',
      'line-width': 1,
      'line-opacity': maskerType === GEOTYPE.District ? 0.9 : 0,
    },
  };

  useEffect(() => {
    districtArea &&
      maskerType === GEOTYPE.District &&
      map.fitBounds(
        [
          [120.8, 30.66],
          [122.16, 31.898],
        ],
        {
          padding: 100,
          maxZoom: 13,
          duration: 1000,
          offset: [0, -50],
        }
      );
  }, [districtArea, maskerType]);

  return (
    <>
      <Source id={id} type="geojson" data={districtData}>
        <Layer {...fillLayer} />
        <Layer {...borderLayer} />
      </Source>
      {popup.visible && (
        <Popup
          longitude={popup.lngLat?.[0] ?? 0}
          latitude={popup.lngLat?.[1] ?? 0}
          anchor="left"
          offset={[0, 100]}
        >
          <div className="anno-panel">{popup.data}</div>
        </Popup>
      )}
    </>
  );
};
export default memo(ProvinceLayer);
