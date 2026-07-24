export function Checkout() {
  return (
    <aside dir="ltr" className="ml-4 pl-4 text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h2>ملخص الطلب</h2>
      <div className="mr-2 left-0"><span>المجموع الفرعي</span><span>200 درهم</span></div>
      <div className="mr-2"><span>الشحن</span><span>مجاني</span></div>
      <div className="mr-2"><strong>الإجمالي</strong><strong>200 درهم</strong></div>
      <button type="submit" className="rounded-l-lg">إتمام الطلب &gt;</button>
    </aside>
  );
}
