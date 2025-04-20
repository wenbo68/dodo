import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Header/>
      {children}
      <Footer/>
    </main>
  );
}