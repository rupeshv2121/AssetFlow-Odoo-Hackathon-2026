import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? "bg-white/80 shadow-sm" : "bg-white/60"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
            <Boxes size={18} />
          </span>
          <span className="text-lg font-bold text-gray-900">AssetFlow</span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          <a href="#modules" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Modules
          </a>
          <a href="#workflow" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Workflow
          </a>
          <a href="#assetflow" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Why AssetFlow
          </a>
          {/* <a href="#resources" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Resources
          </a> */}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="hidden rounded-full bg-sky-700 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-800 md:inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
