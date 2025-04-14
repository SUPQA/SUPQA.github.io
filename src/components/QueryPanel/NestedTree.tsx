import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// const height = 50;
const width = 428;
const dx = 40; // height
const marginTop = 10;
const marginRight = 0;
const marginBottom = 10;
const marginLeft = 40;
let aRootHistory = [];

function _getGradientId(d) {
  return 'lgd-' + d.source.id + '-' + d.target.id;
}

function _getLinkUrl(d) {
  return 'url(#' + _getGradientId(d) + ')';
}

function _getLinkColor(d, bIsSource = false) {
  var sName = bIsSource ? 'source' : 'target';
  return d[sName].color;
}

interface NestedTreeProps {
  data?: any;
  current?: any;
  colorScale?: any;

  setCurrent?: (payload: any) => void;
}

const NestedTree = (props: NestedTreeProps) => {
  const { data, current, colorScale, setCurrent } = props;
  const [treeOption, setTreeOption] = useState<Record<string, any>>();

  const svgRef = useRef(null);
  const linkRef = useRef(null);
  const nodeRef = useRef(null);

  const linkSizeScale = d3.scaleLinear().range([4, 20]).domain([0, 1]);

  const nodeSizeScale = d3
    .scaleSqrt()
    .range([2, 15])
    .clamp(true)
    .domain([0, 10]);

  const diagonal = d3
    .linkHorizontal()
    .x((d) => d.y)
    .y((d) => d.x);

  const highlightNode = useCallback(
    (sourceNode) => {
      let _rootNode;
      // if already highlighted, return to normal state
      if (sourceNode.bHighlighted) {
        delete sourceNode.bHighlighted;

        // get last root node from history
        _rootNode = aRootHistory.length ? aRootHistory.pop() : treeOption.root;
        setTreeOption({
          ...treeOption,
          root: _rootNode,
        });
      } else {
        // push current node in history
        aRootHistory.push(treeOption.root);
        // mark current node as highlighted
        sourceNode.bHighlighted = true;
        // replace as root node
        _rootNode = sourceNode;
        setTreeOption({
          ...treeOption,
          root: _rootNode,
        });
      }

      update(null, _rootNode);
    },
    [treeOption]
  );

  const update = useCallback(
    (event, source) => {
      if (!treeOption) return;
      const { root, tree } = treeOption;

      const svg = d3.select(svgRef.current);
      const gLink = d3.select(linkRef.current);
      const gNode = d3.select(nodeRef.current);
      const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = right.x - left.x + marginTop + marginBottom;

      const transition = svg
        .transition()
        .duration(duration)
        .attr('height', height)
        .attr('viewBox', [-marginLeft, left.x - marginTop, width, height])
        .tween(
          'resize',
          window.ResizeObserver ? null : () => () => svg.dispatch('toggle')
        );

      // Update the nodes…
      const node = gNode.selectAll('g').data(nodes, (d) => d.id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('cursor', 'pointer')
        .attr('transform', (d) => `translate(${source.y0},${source.x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (event, d) => {
          setCurrent(d.data);
        })
        .on('dblclick', (event, d) => {
          d.children = d.children ? null : d._children;
          update(event, d);
        });

      nodeEnter
        .append('circle')
        .attr('r', function (d) {
          return d.children ? nodeSizeScale(d.children.length) : 5;
        })
        .attr('stroke', (d) => {
          return d.data?.key === current?.key ? '#12372a' : null;
        })
        .attr('stroke-width', 4)
        .style('fill-opacity', function (d) {
          return d._children ? 1 : 0.5;
        })
        .style('fill', function (d) {
          return (d.color = colorScale(d.data.name));
        });

      nodeEnter
        .append('text')
        .attr('dy', '0.35em')
        .attr('x', (d) => (d._children ? 20 : 15))
        .attr('y', (d) => (d._children ? 20 : 0))
        .attr('text-anchor', (d) => (d._children ? 'end' : 'start'))
        .text((d) => d.data.name)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white')
        .attr('paint-order', 'stroke');

      // Transition nodes to their new position.
      const nodeUpdate = node
        .merge(nodeEnter)
        .transition(transition)
        .attr('transform', (d) => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke', (d) => {
          return d.data?.key === current?.key ? '#12372a' : null;
        })
        .attr('stroke-opacity', 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node
        .exit()
        .transition(transition)
        .remove()
        .attr('transform', (d) => `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      // Update the links…
      const link = gLink.selectAll('g').data(links, (d) => d.target.id);

      var newLink = link
        .enter()
        .append('g')
        .style('mix-blend-mode', 'multiply')
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-opacity', 0.8)
        .attr('cursor', 'pointer')
        .classed('link', true)
        .on('mouseover', function() {
          d3.select(this).style('stroke-opacity', 0.6);
        })
        .on('mouseout', function() {
          d3.select(this).style('stroke-opacity', 0.8);
        });

      var gradient = newLink
        .append('linearGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('id', function (d) {
          return _getGradientId(d);
        })
        .attr('x1', function (d) {
          return d.source.y;
        })
        .attr('x2', function (d) {
          return d.target.y;
        });

      gradient
        .append('stop')
        .attr('offset', '10%')
        .attr('stop-color', function (d) {
          return _getLinkColor(d, true);
        });

      gradient
        .append('stop')
        .attr('offset', '90%')
        .attr('stop-color', function (d) {
          return _getLinkColor(d);
        });

      // Enter any new links at the parent's previous position.
      const linkEnter = newLink
        .append('path')
        .attr('d', (d) => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        })
        .attr('stroke-width', function (d) {
          const val = d.target.data?.value;
          return val ? linkSizeScale(val) : 10;
        })
        .attr('stroke', (d) => {
          return _getLinkUrl(d);
        })
        .on('click', function (_, d) {
          highlightNode(d.source);
        });

      // Transition links to their new position.
      link
        .select('path')
        .merge(linkEnter)
        .transition(transition)
        .attr('d', diagonal);

      link.select('path').transition().duration(duration).attr('d', diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition().duration(duration).remove();

      link
        .exit()
        .select('path')
        .transition()
        .duration(duration)
        .attr('d', function (d) {
          var o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      // Stash the old positions for transition.
      root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },
    [treeOption, current]
  );

  useEffect(() => {
    treeOption && update(null, treeOption.root);
  }, [update]);

  useEffect(() => {
    if (!data) return;

    const root = d3.hierarchy(data);
    const dy = (width - marginRight - marginLeft) / (1 + root.height);
    const tree = d3.tree().nodeSize([dx, dy]);

    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
    });

    setTreeOption({
      root,
      tree,
    });
  }, [data]);

  return (
    <>
      <svg
        id="nestedTree"
        ref={svgRef}
        viewBox={`${-marginLeft} ${-marginTop} ${width} ${dx}`}
        width={width}
        height={dx}
        style={{
          maxWidth: '100%',
          height: 'auto',
          font: '10px',
          userSelect: 'none',
        }}
      >
        <g
          ref={linkRef}
          className="links"
        ></g>
        <g
          ref={nodeRef}
          className="nodes cursor-pointer "
          pointerEvents="all"
        ></g>
      </svg>
    </>
  );
};

export default NestedTree;
