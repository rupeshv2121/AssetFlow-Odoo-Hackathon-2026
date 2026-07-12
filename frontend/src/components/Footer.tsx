import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-gradient-to-br from-sky-600 to-sky-900 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Column 1 */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">
                <Boxes size={16} />
              </span>

              <span className="text-xl font-bold text-white">
                AssetFlow
              </span>
            </div>

            <p className="mt-3 max-w-xs text-sm leading-6 text-gray-200">
              Enterprise Asset Management System built for the Odoo Hackathon.
              Manage assets, transfers, bookings and maintenance through one
              centralized ERP platform.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">
              Quick Links
            </h4>

            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-gray-200">
                  Home
                </Link>
              </li>

              <li>
                <a href="#solutions" className="hover:text-gray-200">
                  Solutions
                </a>
              </li>

              <li>
                <a href="#workflow" className="hover:text-gray-200">
                  Workflow
                </a>
              </li>

              <li>
                <a href="#modules" className="hover:text-gray-200">
                  Modules
                </a>
              </li>

              <li>
                <a href="#resources" className="hover:text-gray-200">
                  Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">
              Account
            </h4>

            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/login" className="hover:text-gray-200">
                  Log In
                </Link>
              </li>

              <li>
                <Link to="/signup" className="hover:text-gray-200">
                  Get Started
                </Link>
              </li>

              <li>
                <a href="#" className="hover:text-gray-200">
                  Documentation
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-gray-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

        </div>
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-300">
          © {new Date().getFullYear()} AssetFlow
        </div>
      </div>
    </footer>
  );
}
