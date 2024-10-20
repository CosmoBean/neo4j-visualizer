// components/GraphVisualization.tsx
'use client';

import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';

interface GraphVisualizationProps {
  elements: any[];
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ elements }) => {
  // Optional: Define layout options or stylesheet here
  return (
    <div className="w-full h-96 mt-4">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        layout={{ name: 'cose', animate: true }}
        stylesheet={[
          {
            selector: 'node',
            style: {
              'background-color': '#0074D9',
              label: 'data(label)',
              color: '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              label: 'data(label)',
              'font-size': '10px',
              'text-rotation': 'autorotate',
            },
          },
        ]}
      />
    </div>
  );
};

export default GraphVisualization;
