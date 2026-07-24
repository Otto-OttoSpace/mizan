export function ProductCard() {
  return (
    <article dir="rtl" lang="ar" className="pl-3 text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      <img src="/p.jpg" alt="حذاء" />
      <h3>حذاء رياضي</h3>
      <p className="mr-2">499 درهم</p>
      <button>أضف إلى السلة</button>
      <button aria-label="المفضلة">♥</button>
    </article>
  );
}
