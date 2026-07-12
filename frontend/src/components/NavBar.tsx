import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-sm transition-shadow duration-200 ${
        scrolled ? "shadow-sm bg-white/70" : "bg-white/60"
      }`}
      aria-hidden={false}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold text-sky-700">
            AssetFlow
          </Link>

          <nav className="hidden gap-4 md:flex">
            <a href="#features" className="text-sm text-gray-700 hover:text-sky-700">
              Features
            </a>
            <a href="#workflow" className="text-sm text-gray-700 hover:text-sky-700">
              Workflow
            </a>
            <a href="#modules" className="text-sm text-gray-700 hover:text-sky-700">
              Modules
            </a>
            <a href="#about" className="text-sm text-gray-700 hover:text-sky-700">
              About
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="hidden rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 md:inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
