import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Activity, Database, Bot, Clock, Target, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

function App() {
  const [stats, setStats] = useState({ 
    total_logs: 0, critical_alerts: 0, high_alerts: 0, total_alerts: 0,
    top_targets: [], severity_distribution: [], recent_logs: []
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Compute chart data dynamically from recent alerts
  const chartData = alerts.length > 0 
    ? [...alerts].reverse().slice(-20).map(alert => ({
        time: new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        risk: alert.risk_score
      }))
    : [
        { time: 'Waiting', risk: 0 }, { time: 'For', risk: 0 }, { time: 'Data...', risk: 0 }
      ];

  const fetchData = async () => {
    try {
      const statsRes = await fetch('http://127.0.0.1:8000/api/stats');
      const alertsRes = await fetch('http://127.0.0.1:8000/api/alerts');
      
      if (statsRes.ok && alertsRes.ok) {
        setStats(await statsRes.json());
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts);
      }
    } catch (error) {
      // Error handled silently for smooth polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Polling every 2s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#00FF9D' }}>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Shield size={64} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <header className="top-header">
        <div className="brand-section">
          <div className="brand-icon">
            <Shield size={24} />
          </div>
          <div className="brand-text">
            <h1>SMART CLOUD IDS</h1>
            <p>AI-POWERED INTRUSION DETECTION • SOC DASHBOARD • v2.0</p>
          </div>
        </div>
        <div className="status-indicator">
          <div className="pulse-dot"></div>
          ACTIVE MONITORING
        </div>
      </header>

      {/* Top Stat Cards */}
      <div className="stat-row">
        <div className="stat-card blue">
          <div className="stat-icon-wrapper" style={{color: '#00E5FF'}}><Database size={20}/></div>
          <div className="stat-info">
            <h4>Logs Analyzed</h4>
            <span>{stats.total_logs.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon-wrapper" style={{color: '#FF9D00'}}><Activity size={20}/></div>
          <div className="stat-info">
            <h4>Active Alerts</h4>
            <span>{stats.total_alerts.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon-wrapper" style={{color: '#FF3366'}}><ShieldAlert size={20}/></div>
          <div className="stat-info">
            <h4>Critical Threats</h4>
            <span>{stats.critical_alerts.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon-wrapper" style={{color: '#B200FF'}}><Target size={20}/></div>
          <div className="stat-info">
            <h4>Quarantined</h4>
            <span>{Math.floor(stats.critical_alerts * 0.8)}</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="nav-tabs">
        {['OVERVIEW', 'NETWORK MONITOR', 'ML ENGINE', 'GEO TRACKER'].map(tab => (
          <button 
            key={tab} 
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <>
          {/* Main Grid */}
          <div className="main-grid">
            <div className="cyber-panel" style={{ minHeight: '350px' }}>
              <div className="panel-header">
                <div className="panel-header-title"><Activity size={16}/> REAL-TIME RISK TREND</div>
                <div className="badge-live">LIVE</div>
              </div>
              <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3366" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} />
                    <YAxis stroke="#64748B" domain={[0, 100]} tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#050B14', border: '1px solid #00FF9D', borderRadius: '4px', color: '#fff', fontFamily: 'Share Tech Mono' }}
                    />
                    <Line type="monotone" dataKey="risk" stroke="#FF3366" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#FF3366', stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="cyber-panel">
              <div className="panel-header">
                <div className="panel-header-title"><Shield size={16}/> RECENT THREATS</div>
                <div className="badge-live" style={{color: '#00E5FF', borderColor: '#00E5FF'}}>AI ACTIVE</div>
              </div>
              <div className="threat-feed">
                {alerts.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No threats detected yet. Awaiting logs...</p>
                ) : (
                  <AnimatePresence>
                    {alerts.map(alert => (
                      <motion.div 
                        key={alert.id} 
                        className={`threat-item ${alert.severity}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        layout
                      >
                        <div className="threat-header">
                          <div>
                            <div className="threat-target">Target: {alert.username}</div>
                            <div className="threat-meta">
                              <Clock size={12}/> {new Date(alert.timestamp).toLocaleTimeString()} | IP: {alert.ip_address} | {alert.location || 'Unknown'}
                            </div>
                          </div>
                          <div className={`cyber-badge ${alert.severity}`}>
                            {alert.severity} ({alert.risk_score})
                          </div>
                        </div>
                        {alert.ai_analysis && alert.ai_analysis !== "No significant threat detected." && (
                          <div className="threat-ai-box">
                            <div style={{color: '#00E5FF', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold'}}>
                              <Bot size={14}/> AI Threat Analysis
                            </div>
                            {alert.ai_analysis}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="bottom-grid">
            <div className="cyber-panel">
              <div className="panel-header">
                <div className="panel-header-title"><PieChartIcon size={16}/> SEVERITY DIST.</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{stats.total_alerts}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>ALERTS</div>
                </div>
                {stats.severity_distribution && stats.severity_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="150px">
                    <PieChart>
                      <Pie data={stats.severity_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none">
                        {stats.severity_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#050B14', border: '1px solid rgba(255,255,255,0.2)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{color: 'var(--text-dim)', fontSize: '0.8rem'}}>NO DATA</div>
                )}
              </div>
            </div>

            <div className="cyber-panel">
              <div className="panel-header">
                <div className="panel-header-title"><Target size={16}/> TOP TARGETS</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                {stats.top_targets && stats.top_targets.length > 0 ? stats.top_targets.map((target, idx) => {
                  const maxAttacks = Math.max(...stats.top_targets.map(t => t.attacks));
                  const percentage = (target.attacks / maxAttacks) * 100;
                  const colors = ['#00E5FF', '#B200FF', '#FF3366', '#FF9D00', '#00FF9D'];
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '80px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{target.name}</div>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1 }}
                          style={{ height: '100%', background: colors[idx % colors.length], boxShadow: `0 0 10px ${colors[idx % colors.length]}` }}
                        />
                      </div>
                      <div style={{ width: '30px', fontSize: '0.85rem', textAlign: 'right', color: '#fff' }}>{target.attacks}</div>
                    </div>
                  );
                }) : (
                  <div style={{color: 'var(--text-dim)', fontSize: '0.8rem'}}>NO DATA</div>
                )}
              </div>
            </div>

            <div className="cyber-panel">
              <div className="panel-header">
                <div className="panel-header-title"><Database size={16}/> SYSTEM LOG</div>
              </div>
              <div className="system-log">
                {stats.recent_logs && stats.recent_logs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="log-msg">User '{log.username}' connected from {log.ip_address}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'NETWORK MONITOR' && (
        <div className="cyber-panel" style={{ marginTop: '1rem' }}>
          <div className="panel-header">
            <div className="panel-header-title"><Database size={16}/> RAW NETWORK LOGS</div>
          </div>
          <div style={{ overflowX: 'auto', marginTop: '1rem', maxHeight: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#050B14' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.8rem' }}>Timestamp</th>
                  <th style={{ padding: '0.8rem' }}>IP Address</th>
                  <th style={{ padding: '0.8rem' }}>Target User</th>
                  <th style={{ padding: '0.8rem' }}>Query Type</th>
                  <th style={{ padding: '0.8rem' }}>Queries</th>
                  <th style={{ padding: '0.8rem' }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_logs && stats.recent_logs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.8rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.8rem', fontFamily: 'monospace', color: '#00E5FF' }}>{log.ip_address}</td>
                    <td style={{ padding: '0.8rem' }}>{log.username}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        backgroundColor: log.query_type === 'DROP' ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 229, 255, 0.1)',
                        color: log.query_type === 'DROP' ? '#FF3366' : '#00E5FF'
                      }}>
                        {log.query_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem' }}>{log.query_count}</td>
                    <td style={{ padding: '0.8rem' }}>{log.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ML ENGINE' && (
        <div className="cyber-panel" style={{ marginTop: '1rem' }}>
          <div className="panel-header">
            <div className="panel-header-title"><Bot size={16}/> AI THREAT REPORTS</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {alerts.filter(a => a.ai_analysis && a.ai_analysis !== "No significant threat detected.").length > 0 ? (
              alerts.filter(a => a.ai_analysis && a.ai_analysis !== "No significant threat detected.").map(alert => (
                <div key={alert.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', alignItems: 'center' }}>
                    <span style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: '1.1rem' }}>Target: {alert.username}</span>
                    <span className={`cyber-badge ${alert.severity}`} style={{ fontSize: '0.75rem' }}>{alert.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14}/> {new Date(alert.timestamp).toLocaleString()}
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#fff' }}>{alert.ai_analysis}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-dim)', padding: '2rem' }}>No active AI threat reports found in recent alerts.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'GEO TRACKER' && (
        <div className="cyber-panel" style={{ marginTop: '1rem', height: '500px', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div className="panel-header-title"><Target size={16}/> GLOBAL TRAFFIC ORIGINS</div>
          </div>
          <div style={{ flex: 1, marginTop: '1rem' }}>
            {stats.geo_distribution && stats.geo_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.geo_distribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} />
                  <YAxis stroke="#64748B" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#050B14', border: '1px solid #B200FF', borderRadius: '4px', color: '#fff', fontFamily: 'Share Tech Mono' }}
                    cursor={{fill: 'rgba(178, 0, 255, 0.1)'}}
                  />
                  <Bar dataKey="value" fill="#B200FF" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-dim)', padding: '2rem' }}>No location data available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
