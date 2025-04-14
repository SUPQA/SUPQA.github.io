import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as d3 from 'd3';
import { tickFormatter } from '@/lib/utils';

const visHeight = 80;
const marginBottom = 20;
const lineHeight = visHeight - marginBottom;

export interface ITimeLineyRef {
  stepCallback: (index: number) => void;
  delKeyFrame: (target?: number) => void;
  selectRange: (isAdd: number) => void;
  firstFrame: () => void;
}

interface ITimeLineProps {
  width: number;
  current?: number;
  data?: Record<string, number>;
  colorScale?: any;
}

const POILineChart = React.forwardRef((props: ITimeLineProps, ref: any) => {
  const { width, data, colorScale } = props;
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const keyFrameRef = useRef(null);

  const x = d3
    .scaleBand()
    .domain(data ? Object.keys(data) : [])
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, data ? Math.max(...Object.values(data)) + 10 : 1])
    .range([lineHeight, 0]);

  // Add the axis
  useEffect(() => {
    const xAxisGroup = d3.select(xAxisRef.current);
    xAxisGroup.selectAll('*').remove();
    xAxisGroup
      .call(
        d3
          .axisBottom(x)
          .tickSizeInner(0)
          .tickPadding(10)
          .tickFormat(tickFormatter)
      )
      .call((g) => g.select('.domain').remove());

    const yAxisGroup = d3.select(yAxisRef.current);
    yAxisGroup.selectAll('*').remove();
    yAxisGroup
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('x2', width)
          .attr('stroke-opacity', 0.1)
      )
      .call((g) => g.selectAll('.tick text').attr('font-size', 8))
      .call((g) =>
        g
          .append('text')
          .attr('x', -20)
          .attr('y', -10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text('Count')
      );
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const recRef = d3.select(keyFrameRef.current);
    recRef.selectAll('*').remove();

    recRef
      .append('g')
      .attr('fill', 'steelblue')
      .selectAll()
      .data(Object.entries(data))
      .join('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', (d) => y(d[1]))
      .attr('height', (d) => y(0) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('fill-opacity', 0.8)
      .attr('fill', (d) => colorScale?.(d[0]));
  }, [data, colorScale]);

  useImperativeHandle(ref, () => ({
    // delKeyFrame,
    // selectRange,
  }));

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${visHeight}`}
      style={{
        overflow: 'visible',
        width: width,
        height: '100%',
        position: 'relative',
      }}
    >
      <g
        ref={yAxisRef}
        className="axisSegment"
        // transform={`translate(0,0)`}
        color="#87909C"
      ></g>
      <g
        ref={xAxisRef}
        className="axisSegment"
        transform={`translate(0,${lineHeight + 3})`}
      ></g>

      <g
        ref={keyFrameRef}
        className="axisSegment"
        // transform={`translate(30,0)`}
      ></g>
    </svg>
  );
});

export default POILineChart;
