import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Layer, Marker, Popup, Source } from "react-map-gl";
import type { CircleLayer, FillLayer, LineLayer } from "react-map-gl";

import * as d3 from "d3";
import { DSVRowArray } from "d3";
import KDBush from "kdbush";

import { GEOTYPE, useMaskerStore } from "@/models/useMaskerStore";
import _ from "lodash";
import { CategoryItems, throttleTime } from "@/config";
import * as turf from "@turf/turf";
import { getDistance } from "@/lib/utils";
import { throttle } from "lodash";
import { postSelectCircle } from "@/apis";
import mapboxgl from "mapbox-gl";
import { useGlobalStore } from "@/models/useGlobalStore";

const scatterLayer: CircleLayer = {
  id: "scatter",
  type: "circle",
  source: "point-data",
  layout: {},
  paint: {
    "circle-color": ["get", "color"],
    "circle-radius": 5,
    "circle-stroke-color": "#fff",
    "circle-stroke-width": 1,
    "circle-opacity": 1,
  },
};

export interface IPointsIndex {
  lat: number;
  lng: number;
  category: string;
  class: string;
  color: string;
  name: string;
  pointIdx: number;
}

const POILayer = (props: any) => {
  const [points, setPoints] = useState<IPointsIndex[]>([]);
  const [pointsIndex, setPointsIndex] = useState<KDBush>(null);
  const [pointsShow, setPointsShow] = useState<IPointsIndex[]>([]);
  const {
    selectCircle,
    POILanguage,
    POIData,
    POIFilterTarget,
    maskerType,
    selectCustom,
    setPOIPoint,
    setPOIData,
  } = useMaskerStore();
  const { colorScale, map } = useGlobalStore();

  const popup = new mapboxgl.Popup({
    closeButton: false,
    offset: [0, -10],
    className: "poi-popup",
  });

  useEffect(() => {
    d3.csv(
      POILanguage === "en" ? "/data/POI/poi_en.csv" : "/data/POI/poi_cn.csv"
    ).then((data: DSVRowArray) => {
      setPOIData(data);
    });
  }, [POILanguage]);

  useEffect(() => {
    if (!POIData) return;
    const indexPoints: IPointsIndex[] = POIData.map((item, index) => {
      return {
        lat: +item["wgs84_lat"],
        lng: +item["wgs84_lng"],
        category: item["category"].toLowerCase(),
        class: item["class"].toLowerCase(),
        color: colorScale?.(item["category"].toLowerCase()),
        name: item["name"],
        pointIdx: index,
      };
    });
    const pointsIndex = new KDBush(indexPoints.length);

    indexPoints.map((p) => pointsIndex.add(p.lng, p.lat));
    pointsIndex.finish();
    setPoints(indexPoints);
    setPointsIndex(pointsIndex);
  }, [POILanguage, colorScale]);

  const updateScatterThrottled = useCallback(
    throttle(() => {
      if (!pointsIndex) return;
      if (!selectCircle) {
        setPointsShow([]);
        return;
      }

      const centerPoint = turf.point(selectCircle.centroid);
      const bufferPolygon = turf.buffer(centerPoint, selectCircle.radius, {
        steps: 64,
        units: "meters",
      });
      const bounds = turf.bbox(bufferPolygon);

      map.fitBounds(bounds, {
        padding: 200,
        maxZoom: 15,
        duration: 1000,
        offset: [-100, -90],
      });

      // Range returns index of the original array used to build index
      const allDisP = pointsIndex
        .range(bounds[0], bounds[1], bounds[2], bounds[3])
        .map((p) => points[p])
        .filter((p) => {
          return (
            getDistance(
              p.lat,
              p.lng,
              selectCircle.centroid[1],
              selectCircle.centroid[0]
            ) <= selectCircle.radius
          );
        });

      setPOIPoint(allDisP);
      const pToShow =
        POIFilterTarget === "all"
          ? allDisP
          : allDisP.filter((p) => {
              if (
                p.category !== POIFilterTarget &&
                p.class !== POIFilterTarget
              ) {
                return false;
              }
              return true;
            });
      // console.log("pToShow====", POIFilterTarget, pToShow);

      setPointsShow(pToShow);
    }, throttleTime),
    [POIFilterTarget, points, pointsIndex, map, selectCircle]
  );
  useEffect(() => {
    updateScatterThrottled();
  }, [updateScatterThrottled]);

  const updateCustomThrottled = useCallback(
    throttle(() => {
      if (!pointsIndex) return;
      if (!selectCustom) {
        // setPointsShow([]);
        return;
      }

      const bounds = turf.bbox(selectCustom);

      map.fitBounds(bounds, {
        padding: 200,
        maxZoom: 15,
        duration: 1000,
        offset: [0, -50],
      });

      // Range returns index of the original array used to build index
      const query = pointsIndex
        .range(bounds[0], bounds[1], bounds[2], bounds[3])
        .map((p) => points[p])
        .filter((p) => {
          if (
            POIFilterTarget !== "all" &&
            p.category !== POIFilterTarget &&
            p.class !== POIFilterTarget
          ) {
            return false;
          }

          const _p = turf.point([p.lng, p.lat]);
          return turf.booleanPointInPolygon(_p, selectCustom);
        });
      // console.log('selectPOI====', query);
      setPointsShow(query);
    }, throttleTime),
    [POIFilterTarget, points, pointsIndex, map, selectCustom]
  );

  useEffect(() => {
    updateCustomThrottled();
  }, [updateCustomThrottled]);

  const getPointsSource = useMemo(() => {
    var features = pointsShow.map(function (point) {
      return {
        type: "Feature",
        properties: {
          color: point.color,
          title: point.name,
        },
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
      };
    });

    return {
      type: "FeatureCollection",
      features: features,
    };
  }, [pointsShow]);

  useEffect(() => {
    map?.on("mousemove", "scatter", function (e) {
      var feature = e.features[0];
      popup
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${feature.properties.title}</strong>`)
        .addTo(map);
    });

    map?.on("mouseleave", "scatter", function () {
      popup.remove();
    });
  }, [map]);

  return (
    maskerType === GEOTYPE.Community && (
      <>
        <Source id="point-data" type="geojson" data={getPointsSource}>
          <Layer {...scatterLayer} />
        </Source>
        {/* {selectCircle && (
          <Popup
            longitude={
              selectCircle?.centroid[0] + selectCircle.radius_px / 2500
            }
            latitude={selectCircle?.centroid[1]}
            anchor="left"
            offset={[0, 100]}
          >
            <div className="anno-panel">Annotation Panel</div>
          </Popup>
        )} */}
      </>
    )
  );
};
export default POILayer;
