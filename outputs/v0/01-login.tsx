export function Login() {
  return (
    <form dir="ltr" className="ml-4 pl-2 text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1>تسجيل الدخول</h1>
      <input type="email" className="ml-2" />
      <input type="password" className="ml-2" />
      <button type="submit" className="rounded-l-lg">دخول</button>
      <a href="/back">رجوع &lt;</a>
    </form>
  );
}
