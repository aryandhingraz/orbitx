import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext.jsx';
import { formatTemperature } from '../utils/formatters.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { calculateAlertCount } from '../hooks/useAlertCount.js';
import { Legend } from '../components/Legend.jsx';

export function Alerts() {
  const { units } = useSettings();
  const navigate = useNavigate();
  const { geo, weather, airQuality, quakes, iss, currency } = useTelemetry();

  const userLat = geo.data?.latitude;
  const userLon = geo.data?.longitude;

  const [activeFilter, setActiveFilter] = useState('All');

  const alertItems = [];

  // 1. Seismic Alerts
  const severeQuakes = (quakes.data?.quakes || []).filter((q) => q.mag >= 3.5);
  severeQuakes.forEach((q) => {
    alertItems.push({
      id: `quake-${q.id || Math.random()}`,
      category: 'Seismic',
      title: `Mag ${q.mag.toFixed(1)} Earthquake — ${q.place || 'Seismic Zone'}`,
      value: `Magnitude ${q.mag.toFixed(1)}`,
      severity: q.mag >= 5.0 ? 'alert' : 'warning',
      timestamp: q.time ? new Date(q.time).toLocaleTimeString() : 'Recent',
      link: '/explore',
    });
  });

  // 2. Air Quality Alerts
  const aqiVal = airQuality.data?.aqi ?? 25;
  const aqiCategory = airQuality.data?.category || 'Good';
  if (aqiVal > 50) {
    alertItems.push({
      id: 'aqi-alert',
      category: 'Weather & Air',
      title: `Air Quality Index Elevation: ${aqiVal} AQI`,
      value: `${aqiVal} AQI (${aqiCategory})`,
      severity: aqiVal > 150 ? 'alert' : 'warning',
      timestamp: 'Current Snapshot',
      link: '/explore',
    });
  }

  // 3. ISS Orbital Visibility Alert
  if (iss.data?.visibility === 'visible' && userLat != null && userLon != null && iss.data?.latitude != null && iss.data?.longitude != null) {
    const latDiff = Math.abs(userLat - iss.data.latitude);
    const lonDiff = Math.abs(userLon - iss.data.longitude);
    if (latDiff <= 30 && lonDiff <= 30) {
      alertItems.push({
        id: 'iss-alert',
        category: 'Orbital',
        title: `ISS Space Station Overhead Pass (Visible)`,
        value: `Altitude ${iss.data?.altitude ?? 418}km @ ${iss.data?.velocity ? Math.round(iss.data.velocity).toLocaleString() : '27,580'}km/h`,
        severity: 'nominal',
        timestamp: '5-sec Poll Live',
        link: '/satellites',
      });
    }
  }

  // 4. Weather Extremes Alert
  const tempVal = weather.data?.temperature;
  if (tempVal !== undefined && tempVal !== null) {
    if (tempVal > 35 || tempVal < 0) {
      alertItems.push({
        id: 'temp-alert',
        category: 'Weather & Air',
        title: `Extreme Temperature Recorded: ${formatTemperature(tempVal, units)}`,
        value: formatTemperature(tempVal, units),
        severity: 'warning',
        timestamp: 'Current Snapshot',
        link: '/explore',
      });
    }
  }

  // 5. Currency Forex Shift Alert
  if (currency.data?.hasShift) {
    const deltaStr = currency.data.rateDeltaPct >= 0 ? `▲ +${currency.data.rateDeltaPct}%` : `▼ ${currency.data.rateDeltaPct}%`;
    alertItems.push({
      id: 'forex-alert',
      category: 'Currency',
      title: `Forex Exchange Rate Shift: 1 USD = ${currency.data?.rates?.EUR} EUR (${deltaStr})`,
      value: `EUR ${currency.data?.rates?.EUR} (${deltaStr})`,
      severity: 'warning',
      timestamp: '30-min Refresh',
      link: '/compare',
    });
  }

  const activeAlertCount = calculateAlertCount({
    weatherData: weather.data,
    aqiData: airQuality.data,
    quakesData: quakes.data,
    issData: iss.data,
    currencyData: currency.data,
    userLat,
    userLon,
  });

  const filteredAlerts = alertItems.filter((a) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Weather & Air') return a.category === 'Weather & Air';
    if (activeFilter === 'Seismic') return a.category === 'Seismic';
    if (activeFilter === 'Orbital') return a.category === 'Orbital';
    if (activeFilter === 'Currency') return a.category === 'Currency';
    return true;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">
          Command Center Alerts
          <span className="page-title__tag">ONE-STOP FEED</span>
        </h1>
        <p className="page-subtitle">
          Aggregated real-time telemetry alert feed across climate, seismic events, orbital passes, & forex shifts
        </p>
      </header>

      {/* Campaign Tile Banner */}
      <section className="campaign-tile" style={{ padding: 'var(--space-xl)', border: `1px solid ${activeAlertCount > 0 ? 'var(--color-sale)' : 'var(--color-hairline)'}`, backgroundColor: 'var(--color-soft-cloud)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <span className="badge-promo">SYSTEM MONITORING STATUS</span>
            <h2 style={{ fontFamily: 'var(--font-display)', color: activeAlertCount > 0 ? 'var(--color-sale)' : 'var(--color-success-bright)', marginTop: '4px', textTransform: 'uppercase', overflowWrap: 'break-word', wordBreak: 'break-word', fontSize: 'clamp(1rem, 3vw, 2rem)' }}>
              {activeAlertCount > 0 ? `🚨 ${activeAlertCount} ACTIVE TELEMETRY ALERTS` : '✅ ALL PLANETARY SYSTEMS NOMINAL'}
            </h2>
          </div>
          <span className="badge-promo">{alertItems.length} TOTAL FEED ITEMS</span>
        </div>

        {/* Alert Severity Color Legend (§2.2 Item 3) */}
        <Legend title="ALERT SEVERITY KEY" items={[
          { color: 'var(--color-sale)', label: 'Alert (High Severity)' },
          { color: 'var(--color-info)', label: 'Warning / Caution' },
          { color: 'var(--color-success-bright)', label: 'Nominal / Informational' },
        ]} />

        {/* Filter Chips */}
        <div className="tab-strip" style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-hairline-soft)' }}>
          {['All', 'Weather & Air', 'Seismic', 'Orbital', 'Currency'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${activeFilter === cat ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Alert Feed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {filteredAlerts.length === 0 ? (
          <div className="data-widget-card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-mute)' }}>
            No active alerts in this category right now.
          </div>
        ) : (
          filteredAlerts.map((item) => (
            <article
              key={item.id}
              className="data-widget-card"
              style={{ borderLeft: `4px solid ${item.severity === 'alert' ? 'var(--color-sale)' : item.severity === 'warning' ? 'var(--color-info)' : 'var(--color-success-bright)'}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="swatch-dot" style={{ backgroundColor: item.severity === 'alert' ? 'var(--color-sale)' : item.severity === 'warning' ? 'var(--color-info)' : 'var(--color-success-bright)' }}></span>
                    <span className="badge-promo">{item.category.toUpperCase()}</span>
                    <span style={{ fontSize: 'var(--text-caption-sm)', color: 'var(--color-mute)', fontFamily: 'var(--font-mono)' }}>{item.timestamp}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--color-ink)' }}>
                    {item.title}
                  </h3>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ height: '36px', padding: '0 16px', fontSize: 'var(--text-caption-sm)' }}
                  onClick={() => navigate(item.link)}
                >
                  View Details →
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
