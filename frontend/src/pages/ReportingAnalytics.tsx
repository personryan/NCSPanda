import { useEffect, useState } from 'react';
import { fetchVendorSummaryReport, VendorSummaryReport } from '../services/api';
import { getLocalDateInputValue } from '../utils/date';

const outletOptions = [
  { id: 'outlet-b6-chicken-rice', label: 'B6 Chicken Rice' },
  { id: 'outlet-b6-noodles', label: 'B6 Noodles' },
];

export default function ReportingAnalyticsPage() {
  const [outletId, setOutletId] = useState(outletOptions[0].id);
  const [fromDate, setFromDate] = useState(() => getLocalDateInputValue());
  const [toDate, setToDate] = useState(() => getLocalDateInputValue());
  const [summary, setSummary] = useState<VendorSummaryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchVendorSummaryReport(outletId, fromDate, toDate)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load analytics report');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [outletId, fromDate, toDate]);

  return (
    <section className="menu-page">
      <div className="menu-page-header">
        <h1>Reporting & Analytics</h1>
        <p>Operational summary and top-selling items by date range.</p>
      </div>

      <div className="vendor-toolbar-grid">
        <div className="menu-toolbar">
          <label htmlFor="report-outlet" className="form-label">Outlet scope</label>
          <select id="report-outlet" className="form-input" value={outletId} onChange={(e) => setOutletId(e.target.value)}>
            {outletOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="menu-toolbar">
          <label htmlFor="report-from" className="form-label">From</label>
          <input id="report-from" className="form-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="menu-toolbar">
          <label htmlFor="report-to" className="form-label">To</label>
          <input id="report-to" className="form-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      <div className="menu-surface">
        {loading ? <p>Loading report…</p> : null}
        {error ? <p className="alert-error">{error}</p> : null}

        {!loading && !error && summary ? (
          <>
            <div className="vendor-summary-cards">
              <article className="vendor-card"><h3>Total Orders</h3><strong>{summary.totals.orders}</strong></article>
              <article className="vendor-card"><h3>Total Items</h3><strong>{summary.totals.items}</strong></article>
              <article className="vendor-card"><h3>Ready Orders</h3><strong>{summary.statusBreakdown.ready}</strong></article>
            </div>

            <h2>Top Items</h2>
            {!summary.topItems.length ? (
              <p className="menu-empty">No item sales in this period.</p>
            ) : (
              <div className="table-wrap">
                <table className="vendor-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.topItems.map((item) => (
                      <tr key={item.itemId}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
