export function Login() {
  return (
    <form dir="rtl" lang="ar" className="pl-4 text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1>تسجيل الدخول</h1>
      <label>البريد الإلكتروني</label>
      <input type="email" />
      <label>كلمة المرور</label>
      <input type="password" />
      <button type="submit">دخول</button>
      <a href="/back" className="ml-2">رجوع</a>
    </form>
  );
}
