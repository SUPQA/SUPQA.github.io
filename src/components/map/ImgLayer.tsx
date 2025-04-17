import React, { memo, useEffect } from 'react';
import { FillLayer, Layer, RasterLayer, Source } from 'react-map-gl';
import { heatImgSize, imgLatLngBound, mapTiles } from '@/config';
import { GEOTYPE, useMaskerStore } from '@/models/useMaskerStore';

const ImgLayer = (props) => {
  const { imgUrl, id } = props;
  const { maskerType } = useMaskerStore();

  const imageLayer: RasterLayer = {
    id: id,
    source: id,
    type: 'raster',
    paint: {
      'raster-fade-duration': 0,
      'raster-opacity': maskerType === GEOTYPE.District ? 0 : 0.7,
    },
  };

  useEffect(() => {}, []);

  return (
    <>
      <Source id={id} type="image" url={imgUrl} coordinates={imgLatLngBound}>
        <Layer {...imageLayer} />
      </Source>
    </>
  );
};
export default memo(ImgLayer);
