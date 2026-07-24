export function Checkout({ dir = 'rtl' }) {
  return (
    <aside dir={dir} lang="ar" className="ps-4 pe-4 text-start" style={{ fontFamily: '"Cairo", sans-serif' }}>
      <h2>ملخص الطلب</h2>
      <div className="me-2"><span>المجموع الفرعي</span><span>٢٠٠ درهم</span></div>
      <div className="me-2"><span>الشحن</span><span>مجاني</span></div>
      <div className="me-2"><strong>الإجمالي</strong><strong>٢٠٠ درهم</strong></div>
      <button type="submit">إتمام الطلب</button>
    </aside>
  );
}
