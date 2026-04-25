import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { format } from 'date-fns';
import { Database, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BackupMonitoringPage() {
  const { data: logs, error } = await supabaseAdmin
    .from('backup_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50);

  const stats = {
    total: logs?.length || 0,
    success: logs?.filter(l => l.status === 'success').length || 0,
    failed: logs?.filter(l => l.status === 'failed').length || 0,
    running: logs?.filter(l => l.status === 'running').length || 0,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Backup Monitoring
          </h1>
          <p className="text-gray-500">Monitor your Supabase database backups to Google Drive.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="text-xs font-semibold text-green-700 uppercase">Success</span>
            <p className="text-xl font-bold text-green-800">{stats.success}</p>
          </div>
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            <span className="text-xs font-semibold text-red-700 uppercase">Failed</span>
            <p className="text-xl font-bold text-red-800">{stats.failed}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <p>Error loading backup logs: {error.message}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(log.started_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {log.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {log.status === 'running' && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.file_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.file_size ? `${(log.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.finished_at ? 
                      `${Math.round((new Date(log.finished_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s` 
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-500 font-mono">
                    {log.error_message || '-'}
                  </td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Database className="w-12 h-12 text-gray-300 mb-2" />
                      <p>No backup logs found yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
