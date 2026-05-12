import Navbar from '@/components/layouts/navbar/Navbar';
import Footer from '@/components/layouts/Footer';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex-1 pt-20">{children}</div>
      <Footer />
    </>
  );
}
