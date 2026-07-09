import { getDashboardSummary } from "@/lib/analytics/summary";
export default async function DashboardPage(){ const s=await getDashboardSummary(); return <><h1>Dashboard</h1><div className="grid grid-3">{s.cards.map(c=><section className="card" key={c.label}><p className="muted">{c.label}</p><h2>{c.value}</h2><p>{c.detail}</p></section>)}</div></> }
