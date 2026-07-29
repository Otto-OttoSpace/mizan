export function ProductCard({ dir = 'rtl' }) {
  return (
    <article dir={dir} lang="ar" className="ps-3 pe-3 text-start" style={{ fontFamily: '"Cairo", sans-serif' }}>
      <img src="/p.jpg" alt="حذاء رياضي" className="rounded-s-lg" />
      <h3>حذاء رياضي</h3>
      <p className="me-2">٤٩٩ درهم</p>
      <button aria-label="أضف إلى السلة">أضف إلى السلة</button>
      <button aria-label="أضف إلى المفضلة">♥</button>
    </article>
  );
}
