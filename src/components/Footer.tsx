import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} Excel Viewer App. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="#" 
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="hover:text-gray-600 transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="hover:text-gray-600 transition-colors duration-300"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;