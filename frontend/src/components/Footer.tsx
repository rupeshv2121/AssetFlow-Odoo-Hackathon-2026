import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
                <Boxes size={14} />
              </span>
              <span className="text-lg font-bold text-gray-900">AssetFlow</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">Made for the Odoo Hackathon</div>
          </div>

          <div className="flex gap-10">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Quick Links</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <Link to="/" className="hover:text-sky-600">
                    Home
                  </Link>
                </li>
                <li>
                  <a className="hover:text-sky-600" href="#solutions">
                    Solutions
                  </a>
                </li>
                <li>
                  <a className="hover:text-sky-600" href="#resources">
                    Resources
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900">Account</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <Link to="/login" className="hover:text-sky-600">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-sky-600">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-400">
          © {new Date().getFullYear()} AssetFlow
        </div>
      </div>
    </footer>
  );
}
