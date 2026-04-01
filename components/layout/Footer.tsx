"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  const footerColumns = {
    pages: [
      { label: "Home", href: "/" },
      { label: "Movies", href: "/movie" },
      { label: "Series", href: "/series" },
      { label: "About", href: "/about" }
    ],
    socials: [
      { label: "Facebook", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "YouTube", href: "#" }
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" }
    ],
    register: [
      { label: "Sign Up", href: "/signup" },
      { label: "Subscribe", href: "/subscribe" },
      { label: "Gift Cards", href: "/gift-cards" }
    ]
  };

  return (
    <footer className="bg-black text-white py-12 px-8">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          {/* Logo and Copyright Section */}
          <div className="lg:w-1/4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                movie<span className="text-red-600">flix</span>
              </h1>
            </div>
          </div>

          {/* Four Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:w-3/4">
            {/* Pages Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Pages</h3>
              <ul className="space-y-2">
                {footerColumns.pages.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Socials</h3>
              <ul className="space-y-2">
                {footerColumns.socials.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerColumns.legal.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Register Column */}
            <div>
              <h3 className="text-white font-semibold mb-4">Register</h3>
              <ul className="space-y-2">
                {footerColumns.register.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Text Section */}
      <div className="border-t border-gray-800 mt-8 pt-8">
        <div className="container mx-auto">
          {/* Big MOVIEFLIX Name */}
          <div className="text-center mb-8">
            <h2 className="text-6xl md:text-8xl font-bold text-white opacity-20">
              MOVIEFLIX
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2026 movieflix. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <span className="text-gray-400">movieflix is a streaming platform for movies and TV shows.</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">Terms apply.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
