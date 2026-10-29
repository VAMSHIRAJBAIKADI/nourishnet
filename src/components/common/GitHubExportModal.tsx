import React, { useState } from 'react';
import {
  X,
  Github,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Loader2,
  KeyRound
} from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'push' | 'download' | 'instructions'>('push');
  
  // Push state
  const [username, setUsername] = useState('');
  const [repoName, setRepoName] = useState('nourishnet');
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    success: boolean;
    message: string;
    output?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setPushStatus({
        success: false,
        message: 'Please provide a GitHub Personal Access Token to authenticate.'
      });
      return;
    }

    setIsPushing(true);
    setPushStatus(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          repoName: repoName.trim(),
          repoUrl: repoUrl.trim(),
          personalAccessToken: token.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to push to GitHub.');
      }

      setPushStatus({
        success: true,
        message: data.message || 'Successfully pushed code to GitHub!',
        output: data.output
      });
    } catch (err: any) {
      setPushStatus({
        success: false,
        message: err.message || 'Push failed. Please verify repository permissions and token.'
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export & Push to GitHub</h2>
              <p className="text-xs text-slate-300">
                Push your NourishNet full-stack app directly to GitHub or download the ZIP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('push')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'push'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Push Directly to GitHub
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Download Code ZIP
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'instructions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Git Commands
          </button>
        </div>

        {/* Tab 1: Push Directly to GitHub */}
        {activeTab === 'push' && (
          <form onSubmit={handlePush} className="p-6 space-y-4 overflow-y-auto">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Pushing Directly from Cloud to Your GitHub</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  You don't need Git installed on your computer. Enter your GitHub repo details and a Personal Access Token below to push all 51 committed files to your GitHub repository instantly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. vamshiraj1100"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. nourishnet"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 font-medium">
              — OR enter full repository URL —
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full GitHub Repository URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://github.com/your-username/your-repo.git"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  GitHub Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=NourishNet%20Push"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                >
                  Generate Token <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Token must have the <span className="font-semibold text-slate-600">repo</span> scope checked. It is used in-memory for this single push and is never saved to disk.
              </p>
            </div>

            {pushStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  pushStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {pushStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{pushStatus.message}</p>
                  {pushStatus.output && (
                    <pre className="text-[10px] font-mono mt-1 whitespace-pre-wrap bg-white/60 p-2 rounded border border-current/20 max-h-24 overflow-y-auto">
                      {pushStatus.output}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPushing}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isPushing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pushing commits to GitHub...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Push All Code to GitHub</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Download Code ZIP */}
        {activeTab === 'download' && (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Download Entire Codebase ZIP</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Save the complete, production-ready project directly to your local computer (2.9 MB archive containing all frontend, backend, MongoDB schemas, and test accounts).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-800">What's included in the package:</div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                <li>Complete React 19 + Tailwind CSS frontend</li>
                <li>Node.js Express backend + Socket.io real-time server</li>
                <li>MongoDB Mongoose schemas & auto-seeding scripts</li>
                <li>Full REST API with JWT Auth and RBAC middleware</li>
                <li>`DATABASE_SETUP.md` & `README.md` full guides</li>
              </ul>
            </div>

            <a
              href="/api/download-zip"
              download="nourishnet-fullstack.zip"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download nourishnet-fullstack.zip (2.9 MB)</span>
            </a>
          </div>
        )}

        {/* Tab 3: Terminal Git Commands */}
        {activeTab === 'instructions' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <p className="text-xs text-slate-600">
              If you download the ZIP or clone to your local machine, here are the commands to link it to your GitHub repository:
            </p>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2">
              <div className="text-slate-400"># 1. Unzip and navigate to folder</div>
              <div className="text-emerald-400">cd nourishnet</div>
              <div className="text-slate-400 mt-2"># 2. Add your GitHub repository as origin</div>
              <div className="text-emerald-400">
                git remote add origin https://github.com/&lt;your-username&gt;/nourishnet.git
              </div>
              <div className="text-slate-400 mt-2"># 3. Ensure branch is main</div>
              <div className="text-emerald-400">git branch -M main</div>
              <div className="text-slate-400 mt-2"># 4. Push all code to GitHub</div>
              <div className="text-emerald-400">git push -u origin main</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>51 files • Clean Git Main Branch</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
