import { profileSections } from "@/lib/profile/model";
export default function ProfilePage(){ return <><h1>Profile</h1><p className="muted">Manage approved career evidence, preferences, constraints, and writing style.</p><div className="grid grid-3">{profileSections.map(s=><section className="card" key={s.title}><h2>{s.title}</h2><p>{s.description}</p></section>)}</div></> }
