// app/landing/layout.tsx
export const metadata = {
  title: "Clientum - Landing",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
