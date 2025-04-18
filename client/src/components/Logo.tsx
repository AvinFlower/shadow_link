import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <Link href="/">
      <a className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-md bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
          <ChevronLeft className="h-5 w-5 text-background" />
        </div>
        <span className="text-xl font-bold tracking-wider">SHADOWLINK</span>
      </a>
    </Link>
  );
};

export default Logo;
