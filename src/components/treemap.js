import { treemap, hierarchy, scaleOrdinal, schemeDark2, format } from "d3";

export function TreeMap(props) {
  const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;

  const innerWidth = svg_width - margin.left - margin.right;
  const innerHeight = svg_height - margin.top - margin.bottom;

  const root = hierarchy(tree).sum(d => d.children ? 0 : d.value);
  treemap().size([innerWidth, innerHeight]).padding(2)(root);

  const leaves = root.leaves();
  const categories = Array.from(new Set(leaves.map(d => d.parent.data.name)));
  const colorScale = scaleOrdinal(schemeDark2).domain(categories);

  const topGroups = root.children || [];

  const TreemapText = ({ node }) => {
    const { name, attr } = node.data;
    const valueText = format(".1%")(node.value / node.parent.value);
    return (
      <foreignObject width={node.x1 - node.x0} height={node.y1 - node.y0} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "10px", color: "#fff", padding: "1px" }}>
          <div>{attr}: {name}</div>
          <div>Value: {valueText}</div>
        </div>
      </foreignObject>
    );
  };

  const isHighlighted = (ancestors) => {
    if (!selectedCell) return false;
    return selectedCell.every((val, i) => val.name === ancestors[i].name && val.attr === ancestors[i].attr);
  };

  return (
    <svg 
      viewBox={`0 0 ${svg_width} ${svg_height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Color Legend */}
      <g transform="translate(10, 0)">
        {categories.map((cat, i) => (
          <g key={cat} transform={`translate(${i * 150}, 0)`}>
            <rect width={20} height={20} fill={colorScale(cat)} />
            <text x={24} y={14} fontSize="10px">{cat}</text>
          </g>
        ))}
      </g>

      {/* Treemap Rectangles */}
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {leaves.map((node, idx) => {
          const ancestry = node.ancestors().map(d => ({ name: d.data.name, attr: d.data.attr })).slice(0, -1);
          return (
            <g key={`node-${idx}`} transform={`translate(${node.x0}, ${node.y0})`}
              onMouseEnter={() => setSelectedCell(ancestry)}
              onMouseLeave={() => setSelectedCell(null)}
            >
              <rect
                width={node.x1 - node.x0}
                height={node.y1 - node.y0}
                fill={isHighlighted(ancestry) ? "red" : colorScale(node.parent.data.name)}
                opacity={0.8}
              />
              <TreemapText node={node} />
            </g>
          );
        })}

        {/* Group Titles */}
        {topGroups.map((group, i) => {
          const width = group.x1 - group.x0;
          const height = group.y1 - group.y0;
          const centerX = width / 2;
          const centerY = height / 2;
          const rotate = width > height ? 0 : 90;

          return (
            <g key={`group-${i}`} transform={`translate(${group.x0}, ${group.y0})`}>
              <rect width={width} height={height} fill="none" stroke="black" />
              <text
                x={centerX}
                y={centerY}
                fontSize="20px"
                opacity={0.3}
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(${rotate}, ${centerX}, ${centerY})`}
              >
                {group.data.attr}: {group.data.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
