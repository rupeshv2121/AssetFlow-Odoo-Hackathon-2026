import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white/50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-sky-700">AssetFlow</div>
            <div className="mt-2 text-sm text-gray-600">Made for Odoo Hackathon</div>
          </div>

          <div className="flex gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Quick Links</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <Link to="/" className="hover:text-sky-600">
                    Home
                  </Link>
                </li>
                <li>
                  <a className="hover:text-sky-600" href="#modules">
                    Modules
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
              <div className="mt-2 text-sm text-gray-600">github.com/your-org</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">© {new Date().getFullYear()} AssetFlow</div>
      </div>
    </footer>
  );
}
