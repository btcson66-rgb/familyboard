import { useMemo } from 'react';

const columnsByRoute: Array<[RegExp, string[]]> = [
  [/inventory/, ['Room / area', 'Item', 'Brand / model', 'Serial number', 'Purchase / notes']],
  [/warranty/, ['Item', 'Purchase date', 'Warranty term', 'Expires', 'Receipt / contact']],
  [/repair/, ['Date', 'Item / area', 'Problem', 'Service / cost', 'Outcome / next step']],
  [/service-provider/, ['Service', 'Provider', 'Phone / website', 'Last used', 'Notes']],
  [/contact/, ['Person / service', 'Role', 'Primary number', 'Backup method', 'Notes']],
  [/subscription/, ['Service', 'Owner', 'Billing cycle', 'Next renewal', 'Review action']],
  [/renewal/, ['Month', 'Service / policy', 'Owner', 'Due date', 'Action']],
  [/chore/, ['Responsibility', 'Owner', 'Frequency', 'Next turn', 'Complete']],
  [/cleaning/, ['Area', 'Daily reset', 'Weekly task', 'Rotating deep task', 'Owner']],
  [/handoff/, ['Responsibility', 'Current status', 'Next due', 'Contact / location', 'Notes']],
  [/sitter/, ['Time / frequency', 'Task', 'Location / supply', 'Contact', 'Complete']],
  [/moving|new-home/, ['When', 'Task', 'Owner', 'Contact / account', 'Complete']],
  [/emergency-binder/, ['Section', 'What belongs here', 'Location', 'Last reviewed', 'Complete']],
  [/maintenance|seasonal|monthly/, ['Area / asset', 'Task', 'Due / season', 'Source / provider', 'Complete']]
];

export default function PrintableSheet({ route, title }: { route: string; title: string }) {
  const columns = useMemo(() => columnsByRoute.find(([pattern]) => pattern.test(route))?.[1] || ['Item', 'Details', 'Owner', 'Date', 'Complete'], [route]);
  return <section className="printable" aria-labelledby="printable-heading">
    <div className="no-print"><span className="card-tag">Printable worksheet</span><h2 id="printable-heading">Make a clean paper or PDF copy</h2><p>Print this page or choose “Save as PDF.” Add only the details that are safe for the place where you will keep the copy.</p><button onClick={() => window.print()}>Print this worksheet</button></div>
    <h2>{title.replace(/ \|.*$/, '')}</h2>
    <p>Household: ____________________ &nbsp; Review date: ____________________</p>
    <table><thead><tr>{columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{Array.from({ length: 10 }, (_, row) => <tr key={row}>{columns.map((column) => <td key={column}>&nbsp;<br />&nbsp;</td>)}</tr>)}</tbody></table>
  </section>;
}

