"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f5] py-12 text-sm relative z-10 mt-auto border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Column 1: Support */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Support</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/placeholder/manage-bookings" className="hover:text-gray-900 transition-colors">Manage your bookings</Link></li>
              <li><Link href="/placeholder/customer-service" className="hover:text-gray-900 transition-colors">Contact Customer Service</Link></li>
              <li><Link href="/placeholder/safety-resource-centre" className="hover:text-gray-900 transition-colors">Safety resource centre</Link></li>
            </ul>
          </div>

          {/* Column 2: Discover */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Discover</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/programs" className="hover:text-gray-900 transition-colors">Explore Skills</Link></li>
              <li><Link href="/programs?category=technology" className="hover:text-gray-900 transition-colors">Technology Events</Link></li>
              <li><Link href="/programs?category=culinary" className="hover:text-gray-900 transition-colors">Culinary Arts</Link></li>
              <li><Link href="/programs?category=business" className="hover:text-gray-900 transition-colors">Business Workshops</Link></li>
            </ul>
          </div>

          {/* Column 3: Terms and settings */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Terms and settings</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/placeholder/privacy-notice" className="hover:text-gray-900 transition-colors">Privacy Notice</Link></li>
              <li><Link href="/placeholder/terms-of-service" className="hover:text-gray-900 transition-colors">Terms of Service</Link></li>
              <li><Link href="/placeholder/accessibility-statement" className="hover:text-gray-900 transition-colors">Accessibility Statement</Link></li>
              <li><Link href="/placeholder/grievance-officer" className="hover:text-gray-900 transition-colors">Grievance officer</Link></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">About</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/placeholder/about-book-my-skill" className="hover:text-gray-900 transition-colors">About BookMySkill</Link></li>
              <li><Link href="/placeholder/how-we-work" className="hover:text-gray-900 transition-colors">How we work</Link></li>
              <li><Link href="/placeholder/careers" className="hover:text-gray-900 transition-colors">Careers</Link></li>
              <li><Link href="/placeholder/corporate-contact" className="hover:text-gray-900 transition-colors">Corporate contact</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              BookMy<span className="text-gray-500">Training</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-[10px] border border-gray-300">🇮🇳</span>
            <span>INR</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
