export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-10">

      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            ❤️ HeartSense Intelligence
          </h2>
          <p className="text-sm leading-relaxed">
            AI-powered cardiovascular health prediction and
            intelligent medical assistance for preventive care.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Services</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* SERVICES */}
        <div>
          <h3 className="text-white font-semibold mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Risk Prediction</li>
            <li className="hover:text-white cursor-pointer">AI Medical Chat</li>
            <li className="hover:text-white cursor-pointer">Health Analytics</li>
            <li className="hover:text-white cursor-pointer">Consultation</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <p className="text-sm mb-2">Email: support@heartsense.ai</p>
          <p className="text-sm mb-2">Phone: +91 98765 43210</p>

          <div className="flex space-x-4 mt-4 text-lg">
            <span className="hover:text-white cursor-pointer">🌐</span>
            <span className="hover:text-white cursor-pointer">🐦</span>
            <span className="hover:text-white cursor-pointer">📘</span>
          </div>
        </div>

      </div>

      {/* BOTTOM LINE */}
      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-400">
        © 2026 HeartSense Intelligence. All rights reserved.
      </div>

    </footer>
  );
}