// app/page.tsx
'use client';

import React, { useState } from 'react';
import QueryEditor from './components/QueryEditor';
import GraphVisualization from './components/GraphVisualization';
import ResultsTable from './components/ResultsTable';
import axios from 'axios';

interface Neo4jNode {
  identity: string; // Converted to string in API
  labels: string[];
  properties: { [key: string]: any };
}

interface Neo4jRelationship {
  identity: string; // Converted to string in API
  type: string;
  start: string; // Converted to string in API
  end: string; // Converted to string in API
  properties: { [key: string]: any };
}

interface CytoscapeElement {
  data: {
    id: string;
    label?: string;
    source?: string;
    target?: string;
  };
}

const transformRecordsToElements = (records: any[]): CytoscapeElement[] => {
  const elements: CytoscapeElement[] = [];
  const nodeSet = new Set<string>();
  const edgeSet = new Set<string>();

  records.forEach((record, index) => {
    const node: Neo4jNode = record['n'];
    const relationship: Neo4jRelationship = record['r'];
    const targetNode: Neo4jNode = record['m'];

    // Validate nodes and relationships
    if (!node || !relationship || !targetNode) {
      console.warn(`Record at index ${index} is missing 'n', 'r', or 'm':`, record);
      return; // Skip this record
    }

    // Source Node
    const sourceId = node.identity;
    if (!sourceId || typeof sourceId !== 'string') {
      console.warn(`Invalid sourceId in record at index ${index}:`, node);
      return; // Skip this node
    }
    if (!nodeSet.has(sourceId)) {
      elements.push({
        data: { id: sourceId, label: node.labels[0] || 'Unknown' },
      });
      nodeSet.add(sourceId);
    }

    // Target Node
    const targetId = targetNode.identity;
    if (!targetId || typeof targetId !== 'string') {
      console.warn(`Invalid targetId in record at index ${index}:`, targetNode);
      return; // Skip this node
    }
    if (!nodeSet.has(targetId)) {
      elements.push({
        data: { id: targetId, label: targetNode.labels[0] || 'Unknown' },
      });
      nodeSet.add(targetId);
    }

    // Relationship
    const edgeId = relationship.identity;
    if (!edgeId || typeof edgeId !== 'string') {
      console.warn(`Invalid edgeId in record at index ${index}:`, relationship);
      return; // Skip this relationship
    }
    const relationshipType = relationship.type || 'RELATED';

    if (!edgeSet.has(edgeId)) {
      // Ensure source and target IDs are valid
      if (!sourceId || !targetId) {
        console.warn(`Invalid source or target ID for relationship in record at index ${index}:`, relationship);
        return; // Skip this relationship
      }

      // Generate a unique edge ID to prevent duplicates
      const uniqueEdgeId = `${sourceId}-${relationshipType}-${targetId}`;

      elements.push({
        data: {
          id: uniqueEdgeId, // Ensure unique IDs
          source: sourceId,
          target: targetId,
          label: relationshipType,
        },
      });
      edgeSet.add(uniqueEdgeId);
    }
  });

  return elements;
};

const HomePage: React.FC = () => {
  const [query, setQuery] = useState<string>('MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 25');
  const [records, setRecords] = useState<any[]>([]);
  const [elements, setElements] = useState<CytoscapeElement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setRecords([]);
    setElements([]);

    try {
      const response = await axios.post('/api/query', { query });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        const fetchedRecords = response.data.records;
        setRecords(fetchedRecords);
        const transformedElements = transformRecordsToElements(fetchedRecords);
        console.log('Transformed Elements:', transformedElements); // Debugging
        setElements(transformedElements);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Neo4j Visualizer</h1>
      </header>

      <main className="max-w-4xl mx-auto">
        <section>
          <h2 className="text-xl font-semibold mb-2">Cypher Query Editor</h2>
          <QueryEditor query={query} setQuery={setQuery} />
          <button
            onClick={executeQuery}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Executing...' : 'Execute Query'}
          </button>
          {error && <p className="mt-2 text-red-600">Error: {error}</p>}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Graph Visualization</h2>
          {elements.length > 0 ? (
            <GraphVisualization elements={elements} />
          ) : (
            <p>No graph to display. Execute a query to see the visualization.</p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Results Table</h2>
          {records.length > 0 ? <ResultsTable records={records} /> : <p>No results to display.</p>}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
