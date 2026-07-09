import { publicEnv } from "@/lib/config/env";
export default function SettingsPage(){ return <><h1>Settings</h1><section className="card"><h2>Deployment</h2><p className="muted">Public app URL: {publicEnv.NEXT_PUBLIC_APP_URL ?? "not configured"}</p><p>Secrets are configured in Vercel Cloud environment variables, never committed files.</p></section></> }
