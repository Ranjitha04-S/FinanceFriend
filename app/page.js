'use client';
import { useEffect, useState } from 'react';
import { supabase, today, inr } from '../lib/supabase';

const parse = (t) => {
  const s = t.replace(/,/g, '');
  const m = [...s.matchAll(/\d+(\.\d+)?/g)];
  if (!m.length) return null;
  const last = m[m.length - 1];
  const name = s.slice(0, last.index).replace(/\b(rupees?|rs)\b|₹/gi, '').trim();
  return { name: name || 'Customer', amount: parseFloat(last[0]) };
};

export default function Home() {
  const date = today();
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [lang, setLang] = useState('en-IN');
  const [on, setOn] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('collections').select('*').eq('collected_on', date).order('created_at')
      .then(({ data, error }) => error ? setMsg(error.message) : setRows(data || []));
  }, [date]);

  const add = async (n, a) => {
    const { data, error } = await supabase.from('collections')
      .insert({ collected_on: date, name: n, amount: a }).select().single();
    if (error) return setMsg(error.message);
    setRows((r) => [...r, data]); setMsg('');
  };
  const submit = () => {
    const a = parseFloat(amt);
    if (!name.trim() || !a) return setMsg('Enter a name and an amount.');
    add(name.trim(), a); setName(''); setAmt('');
  };
  const remove = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await supabase.from('collections').delete().eq('id', id);
    setRows((r) => r.filter((x) => x.id !== id));
  };
  const listen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setMsg('Voice is not supported in this browser. Use Chrome.');
    const r = new SR(); r.lang = lang; r.interimResults = false;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript, p = parse(t);
      p ? add(p.name, p.amount) : setMsg(`No amount heard in "${t}". Try: Ravi 500`);
    };
    r.onend = () => setOn(false);
    r.onerror = () => { setOn(false); setMsg('Mic error. Allow microphone access.'); };
    setMsg(''); setOn(true); r.start();
  };
  const total = rows.reduce((s, r) => s + Number(r.amount), 0);

  return (<>
    <header>
      <h1>Today’s collection<small>{new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</small></h1>
      <a href="/reports">Reports</a>
    </header>
    {rows.length === 0 ? <p className="empty">No collections yet. Tap Speak and say “Ravi 500”.</p> :
    <table>
      <thead><tr><th>S.No</th><th>Name</th><th className="num">Amount collected</th><th></th></tr></thead>
      <tbody>
        {rows.map((r, i) => (<tr key={r.id}><td>{i + 1}</td><td>{r.name}</td><td className="num">{inr(r.amount)}</td>
          <td><button className="del" onClick={() => remove(r.id)} aria-label="Delete">✕</button></td></tr>))}
        <tr className="total"><td></td><td>Total</td><td className="num">{inr(total)}</td><td></td></tr>
      </tbody>
    </table>}
    <div className="dock">
      <input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Amount" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <div className="row2">
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Voice language">
          <option value="en-IN">English</option><option value="ta-IN">தமிழ்</option><option value="hi-IN">हिन्दी</option>
        </select>
        <button className="add" onClick={submit}>Add entry</button>
        <button className={'mic' + (on ? ' on' : '')} onClick={listen}>{on ? 'Listening…' : '🎤 Speak'}</button>
      </div>
      {msg && <p className="msg">{msg}</p>}
    </div>
  </>);
}
