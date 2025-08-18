'use client';

import { useState, useEffect } from 'react';

export default function TestDBPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [customResult, setCustomResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  // Load connection info on component mount
  useEffect(() => {
    const loadConnectionInfo = async () => {
      try {
        const response = await fetch('/api/test-db/connection-info');
        if (response.ok) {
          const data = await response.json();
          setConnectionInfo(data);
        }
      } catch (error) {
        console.error('Failed to load connection info:', error);
      }
    };
    
    loadConnectionInfo();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('✅ Connected');
        setTestResult(data);
      } else {
        setConnectionStatus('❌ Failed');
        setTestResult(data);
      }
    } catch (error) {
      setConnectionStatus('❌ Error');
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: customQuery }),
      });
      
      const data = await response.json();
      setCustomResult(data);
    } catch (error) {
      setCustomResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      {/* Connection Info Section */}
      {connectionInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Connection Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Host:</span> {connectionInfo.host}
            </div>
            <div>
              <span className="font-medium">Port:</span> {connectionInfo.port}
            </div>
            <div>
              <span className="font-medium">Database:</span> {connectionInfo.database}
            </div>
            <div>
              <span className="font-medium">User:</span> {connectionInfo.user}
            </div>
            <div>
              <span className="font-medium">Environment:</span> {connectionInfo.environment}
            </div>
            <div>
              <span className="font-medium">SSL:</span> {connectionInfo.ssl ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      )}
      
      {/* Connection Test Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Database Connection</h2>
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        {connectionStatus && (
          <div className="mt-4">
            <p className="text-lg font-medium">Status: {connectionStatus}</p>
          </div>
        )}
        
        {testResult && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Custom Query Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Execute Custom Query</h2>
        <div className="mb-4">
          <textarea
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Enter your SQL query here (e.g., SELECT 1 as test, NOW() as current_time)"
            className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
          />
        </div>
        <button
          onClick={executeCustomQuery}
          disabled={loading || !customQuery.trim()}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Executing...' : 'Execute Query'}
        </button>
        
        {customResult && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Query Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(customResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file is configured to connect to {process.env.NODE_ENV === 'development' ? 'your remote MariaDB server' : 'localhost'}</li>
          <li>SSL is currently disabled to avoid connection issues</li>
          <li>Click "Test Connection" to verify the setup</li>
          <li>Use the custom query section to test specific SQL commands</li>
        </ol>
      </div>
    </div>
  );
}
