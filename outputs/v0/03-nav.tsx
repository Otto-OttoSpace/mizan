export function Nav() {
  return (
    <nav dir="ltr" className="pl-4 pr-4 text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      <a href="/" className="mr-auto">شعار</a>
      <ul>
        <li className="ml-3">المنتجات 2024</li>
        <li className="ml-3">الأسعار</li>
        <li className="ml-3 arrow-right">تواصل ›</li>
      </ul>
    </nav>
  );
}
