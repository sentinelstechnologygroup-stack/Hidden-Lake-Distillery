import {commerceEnabled} from "@/data/relaunch";
import BrandMark from "@/components/BrandMark";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/spirits" },
  { label: "Our Story", path: "/about" },
  { label: "The Craft", path: "/craft" },
  { label: "Distribution", path: "/distribution" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { itemCount, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-[#101416] border-b border-[#e7c18d]/30 shadow-lg [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#ffd092] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#ffd092]"
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-10 flex items-center justify-between gap-3 h-20">
        <Link to="/" className="group flex items-center gap-3">
          <BrandMark />
        </Link>

        <div className="hidden xl:flex items-center gap-5">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`font-label text-sm font-semibold tracking-wider py-3 transition-colors ${
                location.pathname === l.path
                  ? "text-[#ffd092] underline underline-offset-8 decoration-2"
                  : "text-[#fff4e1] hover:text-[#ffd092]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`font-label text-sm font-semibold tracking-wider py-3 transition-colors ${
                location.pathname === "/admin"
                  ? "text-[#ffd092] underline underline-offset-8 decoration-2"
                  : "text-[#fff4e1] hover:text-[#ffd092]"
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isAuthenticated && <button onClick={logout} aria-label="Log out" title="Log out" className="hidden xl:inline-flex min-h-11 items-center gap-2 px-3 text-sm text-[#fff4e1] hover:text-[#ffd092]"><LogOut size={18} /> Log out</button>}
          {commerceEnabled && <>
          <Link
            to={isAuthenticated ? "/account" : "/login?returnTo=%2Faccount"}
            aria-label={isAuthenticated ? "My account" : "Log in"}
            className="w-11 h-11 inline-flex items-center justify-center rounded-md text-[#fff4e1] hover:text-[#ffd092] hover:bg-white/10 transition-colors"
          >
            <User size={20} />
          </Link>
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative w-11 h-11 inline-flex items-center justify-center rounded-md text-[#fff4e1] hover:text-[#ffd092] hover:bg-white/10 transition-colors"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-copper text-background text-[10px] font-label leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          </>}
          <button
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden w-11 h-11 inline-flex items-center justify-center rounded-md text-[#fff4e1] hover:bg-white/10"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-navigation" className="xl:hidden bg-[#101416] border-b border-[#e7c18d]/30 max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <div className="px-6 py-6 flex flex-col gap-5">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`font-label text-base font-semibold tracking-wider min-h-12 flex items-center px-3 rounded-md hover:bg-white/10 ${
                  location.pathname === l.path
                    ? "text-[#ffd092] underline underline-offset-8 decoration-2"
                    : "text-[#fff4e1]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && <button onClick={logout} className="flex items-center gap-3 min-h-12 px-3 text-base text-[#fff4e1]"><LogOut size={18} /> Log out</button>}
            {isAdmin && (
              <Link
                to="/admin"
                className="font-label text-base font-semibold tracking-wider min-h-12 flex items-center px-3 rounded-md hover:bg-white/10 text-copper"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}