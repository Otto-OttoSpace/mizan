export function ProductCard() {
  return (
    <article dir="ltr" className="ml-3 pr-2 text-left border-l-2" style={{ fontFamily: 'Inter, sans-serif' }}>
      <img src="/p.jpg" />
      <h3>حذاء رياضي</h3>
      <p className="mr-2 left-0">499 درهم</p>
      <button className="rounded-l-lg">أضف إلى السلة</button>
      <span className="chevron-right">›</span>
    </article>
  );
}
