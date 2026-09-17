import { useEffect, useMemo, useState } from 'react';
import index from '../generated/search-index.json';

// /search/?q=... is a real, linkable search result: the WebSite SearchAction in
// BaseLayout advertises exactly that URL template to Google for the sitelinks
// search box, and the markup is only honest if landing on the URL runs the search.
// The query is adopted after mount rather than in the initial state, because this
// component is server-rendered and seeding state from window.location would make
// the client's first render disagree with the server's HTML.
export default function SiteSearch() {
  const [query, setQuery] = useState('');
  const [adopted, setAdopted] = useState(false);
  const normalized = query.trim().toLowerCase();

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
    if (fromUrl) setQuery(fromUrl);
    setAdopted(true);
  }, []);

  useEffect(() => {
    if (!adopted) return;
    const url = new URL(window.location.href);
    const current = url.searchParams.get('q') ?? '';
    if (current === query.trim()) return;
    if (query.trim()) url.searchParams.set('q', query.trim());
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }, [query, adopted]);

  const results = useMemo(() => {
    if (!normalized) return index.slice(0, 12);
    return index.filter((item) => `${item.title} ${item.description} ${item.keywords} ${item.cluster}`.toLowerCase().includes(normalized)).slice(0, 30);
  }, [normalized]);

  return <section className="search-panel" aria-labelledby="search-heading">
    <h2 id="search-heading">Search by household job</h2>
    <label>Search guides, tools and printables
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try warranty, filter, moving or handoff" autoComplete="off" />
    </label>
    <p className="help" aria-live="polite">{results.length} {results.length === 1 ? 'result' : 'results'} shown</p>
    <div className="card-grid">
      {results.map((item) => <a className="card" href={item.route} key={item.route}>
        <span className="card-tag">{item.cluster.replace('-', ' ')}</span>
        <h3>{item.title.replace(/ \|.*$/, '')}</h3><p>{item.description}</p>
      </a>)}
    </div>
  </section>;
}
