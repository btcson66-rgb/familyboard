import { useMemo, useState } from 'react';
import index from '../generated/search-index.json';

export default function SiteSearch() {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
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

