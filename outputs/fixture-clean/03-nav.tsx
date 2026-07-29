export function Nav({ dir = 'rtl' }) {
  return (
    <nav dir={dir} lang="ar" className="ps-4 pe-4" style={{ fontFamily: '"Cairo", sans-serif' }}>
      <a href="/" className="me-auto" aria-label="الرئيسية">شعار</a>
      <ul className="text-start">
        <li className="ms-3">المنتجات</li>
        <li className="ms-3">الأسعار</li>
        <li className="ms-3">تواصل</li>
      </ul>
    </nav>
  );
}
