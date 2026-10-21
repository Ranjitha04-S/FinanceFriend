'use client';
import { useEffect, useState } from 'react';
import { supabase, inr } from '../../lib/supabase';

export default function Reports() {
  const [days, setDays] = useState([]);
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.from('collections').select('*').order('collected_on', { ascending: false }).order('created_at')
      .then(({ data, error }) => {
        if (error) return setErr(error.message);
        const g = {};
        (data || []).forEach((r) => (g[r.collected_on] ||= []).push(r));
        setDays(Object.entries(g).map(([date, rows]) => ({ date, rows, total: rows.reduce((s, r) => s + Number(r.amount), 0) })));
      });
  }, []);

  const grand = days.reduce((s, d) => s + d.total, 0);
  const fmt = (d) => new Date(d + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (<>
    <header><h1>All reports<small>{days.length} days recorded</small></h1><a href="/">Today</a></header>
    {err && <p className="empty">{err}</p>}
    {!err && days.length === 0 && <p className="empty">No collections recorded yet.</p>}
    {days.length > 0 && <div className="grand"><span>All-time total</span><b>{inr(grand)}</b></div>}
    {days.map((d) => (
      <div className="day" key={d.date}>
        <button onClick={() => setOpen(open === d.date ? null : d.date)}>
          <span>{fmt(d.date)}<small>{d.rows.length} customers</small></span><b>{inr(d.total)}</b>
        </button>
        {open === d.date && <table>
          <thead><tr><th>S.No</th><th>Name</th><th className="num">Amount collected</th></tr></thead>
          <tbody>
            {d.rows.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td>{r.name}</td><td className="num">{inr(r.amount)}</td></tr>)}
            <tr className="total"><td></td><td>Total</td><td className="num">{inr(d.total)}</td></tr>
          </tbody>
        </table>}
      </div>
    ))}
  </>);
}