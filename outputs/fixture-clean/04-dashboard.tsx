export function Dashboard({ dir = 'rtl' }) {
  const kpis = [{ t: 'المبيعات', v: '١٢٬٤٠٠', up: true }, { t: 'الطلبات', v: '٣٤٨', up: false }];
  return (
    <section dir={dir} lang="ar" className="ps-4 pe-4 text-start" style={{ fontFamily: '"Cairo", sans-serif' }}>
      {kpis.map(k => (
        <div key={k.t} className="ms-3">
          <span>{k.t}</span>
          <strong>{k.v}</strong>
          <span aria-label={k.up ? 'ارتفاع' : 'انخفاض'}>{k.up ? '▲' : '▼'}</span>
        </div>
      ))}
    </section>
  );
}
