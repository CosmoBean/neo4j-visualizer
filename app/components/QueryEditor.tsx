// components/QueryEditor.tsx
'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface QueryEditorProps {
  query: string;
  setQuery: (query: string) => void;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ query, setQuery }) => {
  return (
    <div className="w-full h-64">
      <Editor
        height="100%"
        defaultLanguage="cypher"
        value={query}
        onChange={(value) => setQuery(value || '')}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          wordWrap: 'on',
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default QueryEditor;
