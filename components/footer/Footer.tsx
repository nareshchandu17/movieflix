import React from 'react';
import { Youtube, Instagram, Twitter, Linkedin, Play } from 'lucide-react';
import { motion } from 'motion/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { name: 'Movies', href: '#' },
      { name: 'Series', href: '#' },
      { name: 'Trending', href: '#' },
      { name: 'New Releases', href: '#' },
      { name: 'Top Rated', href: '#' },
      { name: 'Coming Soon', href: '#' },
    ],
    genres: [
      { name: 'Action', href: '#' },
      { name: 'Drama', href: '#' },
      { name: 'Crime & Mystery', href: '#' },
      { name: 'Horror', href: '#' },
      { name: 'Anime', href: '#' },
      { name: 'Documentaries', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'FAQ', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
  };

  const socialIcons = [
    { Icon: Youtube, href: '#', label: 'YouTube' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer id="movieflix-footer" className="relative w-full bg-black text-zinc-400 py-20 px-6 md:px-12 lg:px-24 overflow-hidden select-none">
      {/* Layer 2: Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Column 1: Brand Section */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-2 text-white">
              <div className="bg-red-600 p-1.5 rounded-md">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tighter uppercase">MovieFlix</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Unlimited movies, series, and stories from around the world. Experience the future of cinema today.
            </p>
            <div className="flex space-x-4">
              {socialIcons.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -4, color: '#ffffff' }}
                  className="p-2 bg-zinc-900 rounded-full transition-colors hover:bg-zinc-800"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Browse */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">Browse</h3>
            <ul className="flex flex-col space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 4, color: '#ffffff' }}
                    className="text-sm transition-colors block w-fit"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Genres */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">Genres</h3>
            <ul className="flex flex-col space-y-2">
              {footerLinks.genres.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 4, color: '#ffffff' }}
                    className="text-sm transition-colors block w-fit"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">Support</h3>
            <ul className="flex flex-col space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 4, color: '#ffffff' }}
                    className="text-sm transition-colors block w-fit"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
          <p> {currentYear} MovieFlix. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Ad Choices</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>

      {/* Layer 1: Decorative Background Brand - Moved below content */}
      <div
        className="relative mt-12 w-full pointer-events-none z-0 select-none flex justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="flex">
          {"MovieFlix".split("").map((char, index) => (
            <motion.span
              key={index}
              style={{
                WebkitTextFillColor: "black",
                WebkitTextStroke: "1px rgba(63, 63, 70, 0.3)",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,1))",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,1))",
                display: 'inline-block',
                filter: "drop-shadow(0 0 15px rgba(220, 38, 38, 0.8))",
              }}
              whileHover={{
                
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="text-[16vw] font-black leading-none tracking-tight text-center uppercase whitespace-nowrap cursor-default pointer-events-auto transition-all"
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
