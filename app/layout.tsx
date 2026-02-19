import "./globals.css";

export const metadata = {
  title: "Profit Tracker",
  description: "Track your profits easily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lo">
      <body className="font-sans antialiased text-slate-900 bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}