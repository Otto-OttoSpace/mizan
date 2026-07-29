export function Dashboard() {
  const kpis = [{ t: 'المبيعات', v: '12,400' }, { t: 'الطلبات', v: '348' }];
  return (
    <section dir="ltr" className="pl-4 pr-4 text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      {kpis.map(k => (
        <div key={k.t} className="ml-3 border-l-2">
          <span>{k.t}</span>
          <strong>{k.v}</strong>
          <span className="chevron-up">^</span>
        </div>
      ))}
    </section>
  );
}
