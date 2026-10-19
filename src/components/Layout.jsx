import { Outlet, useLocation } from "react-router-dom";
import AgeGate from "@/components/AgeGate";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Layout() {
  const {pathname}=useLocation();
  const informationPage=pathname.startsWith("/policies/");
  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-[90] focus:top-2 focus:left-2 focus:bg-background focus:p-4">Skip to content</a>
      {!informationPage && <AgeGate />}
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}