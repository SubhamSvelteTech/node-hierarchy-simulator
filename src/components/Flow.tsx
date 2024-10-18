"use client";

import { useEffect } from "react";
import * as d3 from "d3";

// Define the data structure for the tree
interface NodeData {
  name: string;
  children?: NodeData[];
  _children?: NodeData[]; // for collapsed nodes
}

const Flow = () => {
  useEffect(() => {
    // Cleanup: Remove existing SVG if it exists
    d3.select("#d3-container").select("svg").remove();

    let i = 0;

    // Define the data
    const data: NodeData = {
      name: "A",
      children: [
        {
          name: "B",
          children: [
            {
              name: "D",
              children: [
                {
                  name: "G",
                  children: [{ name: "H" }, { name: "I" }, { name: "J" }],
                },
              ],
            },
            { name: "E" },
            { name: "F" },
          ],
        },
        { name: "C" },
      ],
    };

    const width = 1200;
    const height = 1000;

    // Create the SVG container
    const svg = d3
      .select("#d3-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(50, 50)");

    const treeLayout = d3.tree<NodeData>().size([width - 100, height - 100]);

    const root: {x0: number; y0: number} | any = d3.hierarchy<NodeData>(data);
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse all children by default
    root.children?.forEach(collapse);

    // Render the initial tree
    update(root);

    function update(source: d3.HierarchyPointNode<NodeData>) {
      const treeData = treeLayout(root);
      const nodes = treeData.descendants();
      const links = treeData.links();

      // Normalize for fixed depth
      nodes.forEach((d) => (d.y = d.depth * 180));

      // Select nodes
      const node = svg
        .selectAll<SVGGElement, d3.HierarchyPointNode<NodeData>>(".node")
        .data(nodes, (d) => (d.id ? d.id : (d.id = ++i)));

      // Enter new nodes
      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", () => `translate(${source.x || 0},${source.y || 0})`)
        .on("click", (event: MouseEvent, d: d3.HierarchyPointNode<NodeData>) => {
          toggleChildren(d);
          update(d);
        });

      nodeEnter
        .append("circle")
        .attr("r", 20)
        .attr("fill", (d) => (d._children ? "lightsteelblue" : "#fff"))
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3);

      nodeEnter
        .append("text")
        .attr("dy", ".35em")
        .attr("x", (d) => (d.children || d._children ? -25 : 25))
        .style("text-anchor", (d) => (d.children || d._children ? "end" : "start"))
        .text((d) => d.data.name);

      // Update positions
      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate
        .transition()
        .duration(500)
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      const nodeExit = node.exit()
        .transition()
        .duration(500)
        .attr("transform", () => `translate(${source.x},${source.y})`)
        .remove();

      nodeExit.select("circle").attr("r", 0);
      nodeExit.select("text").style("fill-opacity", 0);

      // Links between nodes
      const link = svg
        .selectAll<SVGPathElement, d3.HierarchyPointLink<NodeData>>(".link")
        .data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", () => {
          const o = { x: source.x || 0, y: source.y || 0 };
          return diagonal(o, o);
        })
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

      linkEnter
        .merge(link)
        .transition()
        .duration(500)
        .attr("d", (d) => diagonal(d.source, d.target));

      link.exit()
        .transition()
        .duration(500)
        .attr("d", () => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function diagonal(s: { x: number; y: number }, d: { x: number; y: number }) {
      return `M ${s.x} ${s.y}
              C ${(s.x + d.x) / 2} ${s.y},
                ${(s.x + d.x) / 2} ${d.y},
                ${d.x} ${d.y}`;
    }

    function toggleChildren(d: d3.HierarchyPointNode<NodeData>) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    }

    function collapse(node: d3.HierarchyNode<NodeData>) {
      if (node.children) {
        node._children = node.children;
        node.children.forEach(collapse);
        node.children = null;
      }
    }
  }, []);

  return <div id="d3-container"></div>;
};

export default Flow;


// "use client";

// import { useEffect } from "react";
// import * as d3 from "d3";

// const Flow = () => {
//   useEffect(() => {
//     // Cleanup: Remove existing SVG if it exists
//     d3.select("#d3-container").select("svg").remove();

//     let i = 0;

//     const data = {
//       name: "A",
//       children: [
//         {
//           name: "B",
//           children: [
//             {
//               name: "D",
//               children: [
//                 {
//                   name: "G",
//                   children: [{ name: "H" }, { name: "I" }, { name: "J" }],
//                 },
//               ],
//             },
//             { name: "E" },
//             { name: "F" },
//           ],
//         },
//         { name: "C" },
//       ],
//     };

//     const width = 1200;
//     const height = 1000;
//     const svg = d3
//       .select("#d3-container")
//       .append("svg")
//       .attr("width", width)
//       .attr("height", height)
//       .append("g")
//       .attr("transform", "translate(50, 50)");

//     const treeLayout = d3.tree().size([width - 100, height - 100]);

//     const root = d3.hierarchy(data);
//     root.x0 = height / 2;
//     root.y0 = 0;

//     root.children.forEach(collapse);

//     update(root);

//     function update(source) {
//       const treeData = treeLayout(root);
//       const nodes = treeData.descendants();
//       const links = treeData.links();

//       nodes.forEach((d) => (d.y = d.depth * 180));

//       const node = svg.selectAll(".node").data(nodes, (d) => d.id || (d.id = ++i));

//       const nodeEnter = node
//         .enter()
//         .append("g")
//         .attr("class", "node")
//         .attr("transform", (d) => `translate(${source.x || 0},${source.y || 0})`)
//         .on("click", (event, d) => {
//           toggleChildren(d);
//           update(d);
//         });

//       nodeEnter
//         .append("circle")
//         .attr("r", 20)
//         .attr("fill", (d) => (d._children ? "lightsteelblue" : "#fff"))
//         .attr("stroke", "steelblue")
//         .attr("stroke-width", 3);

//       nodeEnter
//         .append("text")
//         .attr("dy", ".35em")
//         .attr("x", (d) => (d.children || d._children ? -25 : 25))
//         .style("text-anchor", (d) => (d.children || d._children ? "end" : "start"))
//         .text((d) => d.data.name);

//       const nodeUpdate = nodeEnter.merge(node);

//       nodeUpdate
//         .transition()
//         .duration(500)
//         .attr("transform", (d) => `translate(${d.x},${d.y})`);

//       const nodeExit = node.exit()
//         .transition()
//         .duration(500)
//         .attr("transform", (d) => `translate(${source.x},${source.y})`)
//         .remove();

//       nodeExit.select("circle").attr("r", 0);
//       nodeExit.select("text").style("fill-opacity", 0);

//       const link = svg.selectAll(".link").data(links, (d) => d.target.id);

//       const linkEnter = link
//         .enter()
//         .insert("path", "g")
//         .attr("class", "link")
//         .attr("d", (d) => {
//           const o = { x: source.x || 0, y: source.y || 0 };
//           return diagonal(o, o);
//         })
//         .attr("fill", "none")
//         .attr("stroke", "#ccc")
//         .attr("stroke-width", 2);

//       linkEnter
//         .merge(link)
//         .transition()
//         .duration(500)
//         .attr("d", (d) => diagonal(d.source, d.target));

//       link.exit()
//         .transition()
//         .duration(500)
//         .attr("d", (d) => {
//           const o = { x: source.x, y: source.y };
//           return diagonal(o, o);
//         })
//         .remove();

//       nodes.forEach((d) => {
//         d.x0 = d.x;
//         d.y0 = d.y;
//       });
//     }

//     function diagonal(s, d) {
//       return `M ${s.x} ${s.y}
//               C ${(s.x + d.x) / 2} ${s.y},
//                 ${(s.x + d.x) / 2} ${d.y},
//                 ${d.x} ${d.y}`;
//     }

//     function toggleChildren(d) {
//       if (d.children) {
//         d._children = d.children;
//         d.children = null;
//       } else {
//         d.children = d._children;
//         d._children = null;
//       }
//     }

//     function collapse(node) {
//       if (node.children) {
//         node._children = node.children;
//         node.children.forEach(collapse);
//         node.children = null;
//       }
//     }
//   }, []);

//   return <div id="d3-container"></div>;
// };

// export default Flow;
