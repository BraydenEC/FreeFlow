/*
  Auth pages share a centred, sidebar-free frame. The route group keeps them
  under the root layout (fonts, prefs, session) without inheriting a sidebar
  that would advertise pages the visitor cannot open yet.
*/
export default function AuthLayout({ children }: LayoutProps<"/"> ) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      {children}
    </main>
  );
}
