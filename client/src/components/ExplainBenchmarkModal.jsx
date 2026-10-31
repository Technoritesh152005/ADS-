import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, Code, BookOpen, Layers } from 'lucide-react';
import { api } from '../utils/api';

export default function ExplainBenchmarkModal({
  isOpen,
  onClose,
  onDataChanged,
  onShowToast,
}) {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [error, setError] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  const runBenchmark = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.runExplainBenchmark();
      setBenchmarkData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to execute explain query');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedStressTest = async (count) => {
    try {
      setSeeding(true);
      const res = await api.seedData(count, false); // append without clearing
      onShowToast(`Seeded ${res.count} items! Running fresh benchmark...`, 'success');
      if (onDataChanged) onDataChanged();
      await runBenchmark();
    } catch (err) {
      onShowToast(err.message || 'Failed to seed stress data', 'error');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runBenchmark();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const indexed = benchmarkData?.indexed || {};
  const unindexed = benchmarkData?.unindexed || {};
  const comparison = benchmarkData?.comparison || {};
  const totalCount = benchmarkData?.totalCollectionCount || 0;

  const indexedScanPercent = totalCount > 0 ? ((indexed.totalDocsExamined / totalCount) * 100).toFixed(1) : 0;
  const unindexedScanPercent = 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="benchmark-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="benchmark-title-wrapper">
            <div className="benchmark-badge-icon">
              <Sparkles size={20} className="text-academic" />
            </div>
            <div>
              <div className="modal-title-row">
                <h3 className="modal-title">Live EXPLAIN() Query Plan Analyzer</h3>
                <span className="badge badge-academic-tag">DBMS Performance Proof</span>
              </div>
              <p className="modal-subtitle">
                Real-time MongoDB <code>explain("executionStats")</code> comparing B-Tree Index Scan (IXSCAN) vs Full Table Scan (COLLSCAN)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && <div className="modal-error-box">{error}</div>}

        {loading ? (
          <div className="benchmark-loading-state">
            <RefreshCw size={28} className="spin text-academic" />
            <p>Executing dual EXPLAIN queries against MongoDB engine...</p>
          </div>
        ) : benchmarkData ? (
          <div className="benchmark-content">
            {/* Query Evaluated Banner */}
            <div className="query-code-banner">
              <span className="query-code-label">Query Executed:</span>
              <code className="query-code-text mono">
                db.items.find({benchmarkData.queryExecuted}).sort({'{ expiryDate: 1 }'})
              </code>
              <button
                onClick={runBenchmark}
                disabled={loading}
                className="btn btn-secondary btn-sm refresh-benchmark-btn"
                title="Rerun benchmark now"
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
                <span>Rerun</span>
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="benchmark-grid">
              {/* Card 1: Indexed Plan */}
              <div className="plan-card plan-card-indexed">
                <div className="plan-card-header">
                  <div className="plan-title-group">
                    <Zap size={18} className="text-emerald" />
                    <h4 className="plan-title">Optimized: B-Tree Index Scan</h4>
                  </div>
                  <span className="badge badge-healthy">IXSCAN + FETCH</span>
                </div>

                <p className="plan-desc">{indexed.description}</p>

                <div className="plan-metrics-list">
                  <div className="metric-row">
                    <span className="metric-name">Stage Plan:</span>
                    <strong className="metric-value mono text-emerald">{indexed.stage}</strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Index Name:</span>
                    <strong className="metric-value mono text-sm">{indexed.indexUsed}</strong>
                  </div>
                  <div className="metric-row highlight-row">
                    <span className="metric-name">Documents Examined:</span>
                    <strong className="metric-value mono text-lg text-emerald">
                      {indexed.totalDocsExamined} <span className="text-xs">({indexedScanPercent}% of DB)</span>
                    </strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Index Keys Traversed:</span>
                    <strong className="metric-value mono">{indexed.totalKeysExamined}</strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Documents Returned:</span>
                    <strong className="metric-value mono">{indexed.nReturned}</strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Time Complexity:</span>
                    <strong className="metric-value mono text-emerald">O(log N) B-Tree</strong>
                  </div>
                </div>

                {/* Progress Visual */}
                <div className="scan-meter-wrapper">
                  <div className="meter-header">
                    <span>Collection Examined:</span>
                    <span className="mono">{indexedScanPercent}%</span>
                  </div>
                  <div className="meter-track">
                    <div
                      className="meter-fill meter-fill-emerald"
                      style={{ width: `${Math.max(5, indexedScanPercent)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card 2: Unindexed Plan */}
              <div className="plan-card plan-card-unindexed">
                <div className="plan-card-header">
                  <div className="plan-title-group">
                    <AlertTriangle size={18} className="text-rose" />
                    <h4 className="plan-title">Unoptimized: Full Collection Scan</h4>
                  </div>
                  <span className="badge badge-expired">COLLSCAN</span>
                </div>

                <p className="plan-desc">{unindexed.description}</p>

                <div className="plan-metrics-list">
                  <div className="metric-row">
                    <span className="metric-name">Stage Plan:</span>
                    <strong className="metric-value mono text-rose">{unindexed.stage}</strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Index Name:</span>
                    <strong className="metric-value mono text-sm text-dim">None (Forced Table Scan)</strong>
                  </div>
                  <div className="metric-row highlight-row unindexed-highlight">
                    <span className="metric-name">Documents Examined:</span>
                    <strong className="metric-value mono text-lg text-rose">
                      {unindexed.totalDocsExamined} <span className="text-xs">({unindexedScanPercent}% of DB)</span>
                    </strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Index Keys Traversed:</span>
                    <strong className="metric-value mono text-dim">0 (Full Scan)</strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Documents Returned:</span>
                    <strong className="metric-value mono">{unindexed.nReturned}</strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Time Complexity:</span>
                    <strong className="metric-value mono text-rose">O(N) Linear Scan</strong>
                  </div>
                </div>

                {/* Progress Visual */}
                <div className="scan-meter-wrapper">
                  <div className="meter-header">
                    <span>Collection Examined:</span>
                    <span className="mono">100% (All Docs)</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill meter-fill-rose" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Evaluation Summary Box */}
            <div className="academic-verdict-box">
              <div className="verdict-icon">
                <BookOpen size={20} className="text-academic" />
              </div>
              <div className="verdict-text">
                <div className="verdict-headline">
                  <strong>Academic Conclusion for Evaluator:</strong>{' '}
                  <span className="text-emerald font-semibold">
                    {comparison.efficiencyRatio} Query Efficiency Gain ({comparison.docsSaved} documents saved from disk I/O)
                  </span>
                </div>
                <p className="verdict-detail">{comparison.academicConclusion}</p>
              </div>
            </div>

            {/* Stress Test Generator Bar */}
            <div className="stress-test-bar">
              <div className="stress-test-info">
                <Layers size={16} className="text-muted" />
                <span>
                  Current Collection: <strong>{totalCount} items</strong>. Test scalability under volume:
                </span>
              </div>
              <div className="stress-test-buttons">
                <button
                  disabled={seeding}
                  onClick={() => handleSeedStressTest(250)}
                  className="btn btn-secondary btn-sm"
                  title="Add 250 test items"
                >
                  + Add 250 Items
                </button>
                <button
                  disabled={seeding}
                  onClick={() => handleSeedStressTest(1000)}
                  className="btn btn-secondary btn-sm"
                  title="Add 1,000 test items to widen COLLSCAN penalty"
                >
                  + Add 1,000 Items
                </button>
              </div>
            </div>

            {/* Toggle Raw JSON */}
            <div className="raw-json-section">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="btn btn-secondary btn-sm raw-json-toggle"
              >
                <Code size={14} />
                <span>{showRawJson ? 'Hide Raw MongoDB JSON' : 'Inspect Raw MongoDB explain() JSON'}</span>
              </button>

              {showRawJson && (
                <div className="raw-json-viewer mono">
                  <pre>{JSON.stringify(benchmarkData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
}
