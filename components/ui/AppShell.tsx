import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"], ["Profile", "/profile"], ["Jobs", "/jobs"],
  ["Applications", "/applications"], ["Interviews", "/interviews"], ["Outcomes", "/outcomes"], ["Settings", "/settings"]
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="shell"><aside className="nav"><h2>AI Job Search</h2>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/api/auth/signin">Sign in</Link></aside><main className="main">{children}</main></div>;
}
