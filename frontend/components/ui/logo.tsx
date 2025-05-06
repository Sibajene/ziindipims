import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  asLink?: boolean;
}

export function Logo({ 
  variant = 'default', 
  size = 'md',
  withText = true,
  asLink = true,
}: LogoProps) {
  // Size mapping
  const sizeMap = {
    sm: { container: 'w-7 h-7', text: 'text-base' },
    md: { container: 'w-9 h-9', text: 'text-lg' },
    lg: { container: 'w-24 h-24', text: 'text-xl' }
  };
  
  // Color mapping
  const colorMap = {
    default: { bg: '', text: 'text-indigo-600', logo: 'text-indigo-600' },
    white: { bg: '', text: 'text-white', logo: 'text-indigo-600' }
  };

  // The logo content without the Link wrapper
  const LogoContent = () => (
    <div className="flex items-center space-x-2">
      <div className={`${sizeMap[size].container} ${colorMap[variant].bg} rounded-full flex items-center justify-center`}>
        <Image 
          src="/images/LogoZiindiSoft.png" 
          alt="ZiindiPro Logo" 
          width={size === 'sm' ? 30 : size === 'md' ? 80 : 120} 
          height={size === 'sm' ? 30 : size === 'md' ? 80 : 120} 
          className="object-contain"
        />
      </div>
    </div>
  );

  // Return with or without Link wrapper based on asLink prop
  if (asLink) {
    return (
      <Link href="/" className="flex items-center space-x-2">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}