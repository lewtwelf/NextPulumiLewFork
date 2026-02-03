"use client";

import { useState } from 'react';

export default function Home() {
  const [instanceName, setInstanceName] = useState('');
  const [zone, setZone] = useState('us-central1-a');
  const [machineType, setMachineType] = useState('e2-micro');
  const [project, setProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setResult(null);
    
    try {
      setLogs(prev => [...prev, "Starting deployment..."]);
      
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName, zone, machineType, project }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      setResult(data);
      setLogs(prev => [...prev, "Deployment successful!", JSON.stringify(data.outputs, null, 2)]);
      
    } catch (err: any) {
      setLogs(prev => [...prev, `Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <main className="max-w-2xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GCP Instance Deployer
          </h1>
          <p className="text-gray-400">Programmatic infrastructure with Pulumi</p>
        </header>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleDeploy} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Instance Name</label>
                <input
                  type="text"
                  required
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="e.g. my-server-1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">GCP Project ID</label>
                <input
                  type="text"
                  required
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="e.g. my-project-id"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Zone</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="us-central1-a">us-central1-a</option>
                  <option value="us-west1-b">us-west1-b</option>
                  <option value="europe-west1-b">europe-west1-b</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Machine Type</label>
                <select
                  value={machineType}
                  onChange={(e) => setMachineType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="e2-micro">e2-micro</option>
                  <option value="e2-small">e2-small</option>
                  <option value="n1-standard-1">n1-standard-1</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                loading 
                  ? 'bg-gray-700 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deploying Resources...
                </span>
              ) : (
                'Deploy Instance'
              )}
            </button>
          </form>
        </div>

        {/* Console / Logs Area */}
        <div className="bg-black/50 border border-gray-800/50 rounded-2xl p-6 font-mono text-sm shadow-inner min-h-[200px]">
           <div className="flex items-center gap-2 mb-4 text-gray-400 border-b border-gray-800 pb-2">
             <span className="w-3 h-3 rounded-full bg-red-500/50" />
             <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
             <span className="w-3 h-3 rounded-full bg-green-500/50" />
             <span className="ml-2 uppercase tracking-widest text-xs">Deployment Logs</span>
           </div>
           
           <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
             {logs.length === 0 && <span className="text-gray-600 italic">Ready to deploy...</span>}
             {logs.map((log, i) => (
               <div key={i} className="text-gray-300 break-all whitespace-pre-wrap border-l-2 border-blue-500/20 pl-3">
                 {log}
               </div>
             ))}
           </div>
        </div>
        
        {result && (
            <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h3 className="text-green-400 font-bold mb-2">Instance Created Successfully!</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 block">Instance Name</span>
                        <span className="text-white">{result.outputs.instanceName.value}</span>
                    </div>
                     <div>
                        <span className="text-gray-500 block">External IP</span>
                        <span className="text-white">{result.outputs.instanceExternalIp.value}</span>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
