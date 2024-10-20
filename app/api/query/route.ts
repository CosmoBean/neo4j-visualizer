// app/api/query/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/neo4j';
import neo4j from 'neo4j-driver'; // Ensure neo4j is imported

interface QueryRequest {
  query: string;
}

// Helper function to recursively convert Neo4j Integers to strings
const serializeRecord = (value: any): any => {
  if (neo4j.isInt(value)) {
    return value.toString();
  } else if (Array.isArray(value)) {
    return value.map(serializeRecord);
  } else if (value !== null && typeof value === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        newObj[key] = serializeRecord(value[key]);
      }
    }
    return newObj;
  } else {
    return value;
  }
};

export async function POST(request: Request) {
  try {
    const { query }: QueryRequest = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const session = getSession();

    try {
      const result = await session.run(query);
      const records = result.records.map(record => {
        const obj: { [key: string]: any } = {};
        record.keys.forEach(key => {
          const value = record.get(key);
          obj[key] = serializeRecord(value);
        });
        return obj;
      });

      console.log('API Response Records:', records); // Debugging

      return NextResponse.json({ records }, { status: 200 });
    } catch (error: any) {
      console.error('Neo4j Query Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
      await session.close();
    }
  } catch (error: any) {
    console.error('Invalid Request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
