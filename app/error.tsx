"use client";
export default function Error({ error }: { error: Error }){ return <main className="container"><section className="card"><h1>Something went wrong</h1><p>{error.message}</p></section></main> }
