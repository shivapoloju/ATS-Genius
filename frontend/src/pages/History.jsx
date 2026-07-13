import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash, Eye, ClockCounterClockwise, Plus } from '@phosphor-icons/react';
import { fetchAnalyses, deleteAnalysis } from '../lib/api';
import { HISTORY } from '../constants/testIds';

const scoreColor = (score) => {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
};

const History = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses()
      .then(setAnalyses)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await deleteAnalysis(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-24 text-center text-slate-500">Loading history...</div>;
  }

  return (
    <div data-testid={HISTORY.page} className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10 border-b border-slate-200 pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
            Your Session
          </p>
          <h1 className="font-heading text-3xl font-black tracking-tighter text-slate-900">
            Analysis History
          </h1>
        </div>
        <Link
          to="/analyze"
          data-testid={HISTORY.newAnalysisCta}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-[#002277] transition-colors duration-200"
        >
          <Plus size={16} weight="bold" />
          New Analysis
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div data-testid={HISTORY.emptyState} className="text-center py-24 border border-dashed border-slate-300">
          <ClockCounterClockwise size={40} weight="bold" className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No analyses yet in this session.</p>
          <Link to="/analyze" className="text-primary font-semibold underline text-sm mt-2 inline-block">
            Run your first analysis
          </Link>
        </div>
      ) : (
        <div className="border border-slate-200">
          {analyses.map((a) => (
            <div
              key={a.id}
              data-testid={HISTORY.row}
              className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors duration-200"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{a.job_title || 'Untitled Role'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {a.resume_filename} &middot; {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`font-heading text-2xl font-bold shrink-0 ${scoreColor(a.ats_score)}`}>
                {a.ats_score}%
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  data-testid={`${HISTORY.viewButton}-${a.id}`}
                  onClick={() => navigate(`/results/${a.id}`)}
                  className="p-2.5 text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors duration-200"
                >
                  <Eye size={18} weight="bold" />
                </button>
                <button
                  data-testid={`${HISTORY.deleteButton}-${a.id}`}
                  onClick={() => handleDelete(a.id)}
                  className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors duration-200"
                >
                  <Trash size={18} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
