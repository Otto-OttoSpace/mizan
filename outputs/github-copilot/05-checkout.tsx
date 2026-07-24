export function Checkout() {
  return (
    <aside dir="rtl" lang="ar" className="pl-4 text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h2>ملخص الطلب</h2>
      <div className="mr-2"><span>المجموع الفرعي</span><span>200 درهم</span></div>
      <div className="mr-2"><span>الشحن</span><span>مجاني</span></div>
      <div className="mr-2"><strong>الإجمالي</strong><strong>200 درهم</strong></div>
      <button type="submit">إتمام الطلب</button>
    </aside>
  );
}
