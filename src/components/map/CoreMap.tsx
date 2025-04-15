import React, { useCallback, useMemo, useState } from "react";
import { useEffect, useRef } from "react";
import Map, {
  MapProvider,
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  Popup,
  Source,
  Layer,
  Marker,
  useControl,
} from "react-map-gl";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MAP_STYLE } from "@/config";
import { useMapStore } from "@/models/useMapStore";
import { GEOTYPE, useMaskerStore } from "@/models/useMaskerStore";
import ImgLayer from "./ImgLayer";
import POILayer from "./POILayer";
import MaskLayer from "./MaskLayer";
import { getDistance } from "@/lib/utils";
import ProvinceLayer from "./ProvinceLayer";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import DrawControl from "./DrawControl";

const VITE_MAP_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface ICoreMapProps {
  setHoverCoord?: Function;
}

const CoreMap = (props: ICoreMapProps) => {
  const { setHoverCoord } = props;
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    latitude: 31.15,
    longitude: 121.46,
    zoom: 9.5,
  });
  const [features, setFeatures] = useState({});
  const [districtPopup, setDistrictPopup] = useState<any>({
    visible: false,
    lntlat: [0, 0],
    data: {},
  });

  const { heatMapImg, setMap } = useMapStore();
  const {
    circleList,
    setSelectCircle,
    maskerType,
    setCustomFeatures,
    setSelectCustom,
  } = useMaskerStore();
  // const onMouseEnter = (evt) => {
  //   console.log('onMouseEnter===', evt.features[0].properties);
  //   setHoverMarker(evt.features[0].properties);
  // };

  // const onMouseLeave = (evt) => {
  //   setHoverCoord(undefined);
  // };

  const onUpdate = useCallback((e) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        newFeatures[f.id] = f;
      }

      return newFeatures;
    });
  }, []);

  const onDelete = useCallback((e) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        delete newFeatures[f.id];
      }
      return newFeatures;
    });
  }, []);
  useEffect(() => {
    console.log("onUpdate===", features);
    setCustomFeatures(
      Object.values(features).map((item: any) => item.geometry)
    );
  }, [features]);

  const onSelect = useCallback(
    (e) => {
      if (e.features.length === 0) return;
      setSelectCustom(e.features[0]);

      console.log("onSelect===", e.features);
    },
    [mapRef]
  );

  const onClick = useCallback(
    (evt) => {
      const lnglat = evt.lngLat;

      if (maskerType === GEOTYPE.Community && circleList) {
        const target = circleList?.find(
          (p) =>
            getDistance(lnglat.lat, lnglat.lng, p.centroid[1], p.centroid[0]) <=
            p.radius
        );
        console.log("onclick map target ===", target);

        setSelectCircle(target);
        return;
      }
    },
    [circleList, maskerType]
  );

  const onLoad = () => {
    const map = mapRef.current.getMap();
    const layers = map.getStyle().layers;
    //waterway-polygons-heatmap-building
    map.moveLayer("heatmap", "waterway");
    map.moveLayer("district", "waterway");
    map.moveLayer("building", "heatmap");
    // map.moveLayer('polygons', 'waterway');

    console.log("onload===layers", layers);

    // map.loadImage(LocationIcon, (error, image) => {
    //   if (error) throw error;
    //   map.addImage('custom-marker', image);
    // });
  };

  useEffect(() => {
    if (!mapRef.current) return;
    setMap(mapRef.current.getMap());
  }, [mapRef.current]);

  function showPopup(e) {
    const features = e.features;
    if (!mapRef.current) return;

    const map = mapRef.current?.getMap();
    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer";
      const properties = features[0].properties;
      const cityName = properties.name; // 城市名称

      setDistrictPopup({
        visible: false,
        lngLat: JSON.parse(properties.center),
        data: cityName,
      });
    } else {
      map.getCanvas().style.cursor = "";
    }
  }

  return (
    <>
      <Map
        {...viewState}
        ref={mapRef}
        mapboxAccessToken={VITE_MAP_TOKEN}
        // projection={{
        //   name: 'equirectangular',
        // }}
        mapStyle={MAP_STYLE.Light}
        // interactiveLayerIds={['points']}
        onLoad={onLoad}
        onMove={(evt) => {
          setViewState(evt.viewState);
          // console.log(evt.viewState);
        }}
        interactiveLayerIds={["district"]}
        onMouseMove={(evt) => {
          // setHoverCoord(evt.lngLat);
          // changeLocation(evt.lngLat);
          showPopup(evt);
        }}
        onMoveEnd={() => {
          // console.log('====onMoveEnd');
        }}
        onClick={onClick}
        // onMouseEnter={onMouseEnter}
        // onMouseLeave={onMouseLeave}
        onStyleData={() => {}}
      >
        <ImgLayer id="heatmap" imgUrl={heatMapImg} />
        <MaskLayer />
        <POILayer />
        <ProvinceLayer id="district" popup={districtPopup} />

        <NavigationControl showCompass={false} />
        {/* <SquareControl className="mapboxgl-layers-icon" onClick={() => {}} /> */}
        <DrawControl
          displayControlsDefault={false}
          controls={{
            polygon: true,
            trash: true,
          }}
          onCreate={onUpdate}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      </Map>
    </>
  );
};

export default CoreMap;
