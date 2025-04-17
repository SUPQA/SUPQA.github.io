import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import {
  findClosestPointOnPolygonEdges,
  getLegendXY,
  getSubPolygon,
  getVertices,
  isPointInsidePolygon,
} from "@/lib/util4PolygonSlider";
import { useGlobalStore } from "@/models/useGlobalStore";

export interface IPolygonSliderRef {
  stepCallback: (index: number) => void;
  delKeyFrame: (target?: number) => void;
  selectRange: (isAdd: number) => void;
  firstFrame: () => void;
}

interface IPolygonSliderProps {
  width: number;
  height: number;
  vertex?: number;
  data?: any;
  colorScale?: any;

  handleClick?: (index) => void;
  scaleCallback?: (start, end) => void;
  handleSelectTimeCallback?: (params: number[]) => void;
}

const PolygonSlider = React.forwardRef(
  (props: IPolygonSliderProps, ref: any) => {
    const { width, height, colorScale, vertex = 3 } = props;
    const { info, measureCategory } = useGlobalStore();
    const data = info?.measureList;

    const svgRef = useRef(null);
    const polygonRef = useRef(null);
    const handleRef = useRef(null);
    const axisRef = useRef(null);
    const labelRef = useRef(null);
    const legendRef = useRef(null);
    const weightRef = useRef(null);

    const [handlePos, setHandlePos] = useState<number[]>([
      width / 2,
      height / 2,
    ]);

    useEffect(() => {
      info?.handlePos && setHandlePos(info?.handlePos);
    }, [info]);

    const cx = width / 2;
    const cy = height / 2;
    const r = width * 0.4;
    const points = getVertices(vertex, r, cx, cy, 0);

    const line = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1]);

    const singleS = 2 * r * Math.sin(Math.PI / vertex);
    const x = d3.scaleLinear().domain([0, 1]).range([0, singleS]);

    const subPolygon = useMemo(() => {
      const subData = getSubPolygon(handlePos, points);
      weightRef.current = subData;
      return subData;
    }, [handlePos, points]);

    // * Edge axis
    useEffect(() => {
      if (!measureCategory) return;

      // 计算角度
      const axisData = points.slice(0, -1).map((d, index) => {
        const ed = points[(index + 1) % points.length];
        const angle = Math.atan2(ed[1] - d[1], ed[0] - d[0]) * (180 / Math.PI);
        return {
          x: d[0],
          y: d[1],
          angle,
        };
      });

      const axis = d3.select(axisRef.current);
      axis.selectAll("*").remove();
      axisData.forEach((ad, index) => {
        const wrapG = axis.append("g").attr("class", "axis-wrap");
        const measure = data?.[index];
        const children = measureCategory?.[measure];
        const color = colorScale?.(measure);
        // console.log('🚨 ~ ad:', measure, children, color);
        if (!children) return;
        wrapG
          .append("g")
          .call(d3.axisTop(x).ticks(3).tickSizeInner(5))
          .attr("color", "#b2b2b2");
        wrapG
          .append("g")
          .selectAll("circle")
          .data(children)
          .enter()
          .append("circle")
          .attr("r", 4)
          .attr("fill", (d) => colorScale?.(d.category))
          .attr("stroke", "#b2b2b2")
          .attr("stroke-width", 1)
          .attr("transform", (d) => `translate(${x(d.value)} 0)`);

        // 整体位移
        wrapG.attr(
          "transform",
          `translate(${ad.x} ${ad.y}) rotate(${ad.angle})`
        );
      });
    }, [points, measureCategory]);

    // * Legends
    useEffect(() => {
      if (!colorScale) return;
      const circleCenter = [width / 2, height / 2];
      const averageSub = getSubPolygon(circleCenter, points);

      const legend = d3.select(legendRef.current);
      legend.selectAll("*").remove();
      averageSub.forEach((ad, index) => {
        const coordAngle = getLegendXY(circleCenter, ad.centroid, r + 5);
        legend
          .append("g")
          .call((g) =>
            g
              .append("text")
              .text(() => data?.[index])
              .attr("text-anchor", "middle")
              .attr("font-size", 14)
          )
          .attr(
            "transform",
            `translate(${coordAngle[0]} ${coordAngle[1]}) rotate(${coordAngle[2]})`
          );
      });
    }, [colorScale, data, points]);

    // * Sub Polygon Line
    useEffect(() => {
      const polygons = d3.select(polygonRef.current);

      polygons.selectAll("*").remove();
      polygons
        .selectAll("path")
        .data(subPolygon)
        .enter()
        .append("path")
        .attr("d", (d) => line(d.vertices))
        // .attr('opacity', 0.8)
        .style("fill", (d, index) => colorScale?.(data?.[index]) ?? "#fff");
      // .style('stroke', '#000');

      const labels = d3.select(labelRef.current);
      labels.selectAll("*").remove();
      labels
        .selectAll("text")
        .data(subPolygon)
        .enter()
        .filter((d) => d.percent > 0)
        .append("text")
        .text((d) => `${d.percent} %`)
        .attr("font-size", 16)
        .attr("font-weight", 700)
        .attr("x", (d) => d.centroid[0] - 20)
        .attr("y", (d) => d.centroid[1]);
    }, [polygonRef, subPolygon, data]);

    // * Handle Drag
    const drag = useCallback((event) => {
      const x = event.x;
      const y = event.y;

      let endPos = [x, y];
      const isInPolygon = isPointInsidePolygon(endPos, points);
      if (!isInPolygon) {
        endPos = findClosestPointOnPolygonEdges(endPos, points);
      }
      // console.log(endPos);

      setHandlePos(endPos);
    }, []);

    useEffect(() => {
      const handle = d3.select(handleRef.current);
      handle.call(
        d3
          .drag()
          .on("drag", drag)
          .on("end", () => {
            console.log("✋ ~ drag end:", weightRef.current);
          })
      );
    }, []);

    useImperativeHandle(ref, () => ({
      weightRef,
      // selectRange,
    }));

    return (
      <svg
        id="polygon-slider"
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
      >
        <g ref={polygonRef} className="polygons"></g>
        <g ref={axisRef} className="axis"></g>
        <g ref={legendRef} className="legends"></g>
        <g ref={labelRef} className="labels"></g>
        <circle
          ref={handleRef}
          className="handle"
          r={8}
          cx={handlePos[0]}
          cy={handlePos[1]}
          fill="#000"
          style={{ cursor: "pointer" }}
        />
      </svg>
    );
  }
);

export default PolygonSlider;
