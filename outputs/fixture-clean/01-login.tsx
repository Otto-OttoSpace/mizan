export function Login({ dir = 'rtl' }: { dir?: string }) {
  return (
    <form dir={dir} lang="ar" className="ps-4 pe-4 text-start" style={{ fontFamily: '"Cairo", "IBM Plex Sans Arabic", sans-serif' }}>
      <h1>تسجيل الدخول</h1>
      <label htmlFor="email">البريد الإلكتروني</label>
      <input id="email" type="email" aria-label="البريد الإلكتروني" />
      <label htmlFor="pw">كلمة المرور</label>
      <input id="pw" type="password" aria-label="كلمة المرور" />
      <button type="submit">دخول</button>
      <a href="/back" className="ms-2">رجوع</a>
    </form>
  );
}
