import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Wand2, Menu, BookOpen, Users, Image } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Wand2 className="text-3xl text-coral animate-wiggle" />
            <h1 className="fredoka text-2xl text-darkgray">StoryMagic</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/gallery" className="text-darkgray hover:text-coral transition-colors font-semibold">
              <BookOpen className="inline mr-2" size={18} />
              My Stories
            </Link>
            <Link href="/character-creator" className="text-darkgray hover:text-coral transition-colors font-semibold">
              <Users className="inline mr-2" size={18} />
              Characters
            </Link>
            <Link href="/gallery" className="text-darkgray hover:text-coral transition-colors font-semibold">
              <Image className="inline mr-2" size={18} />
              Gallery
            </Link>
            <Link href="/character-creator">
              <Button className="bg-coral text-white hover:bg-[#ff5252] transition-colors font-semibold rounded-full">
                <Wand2 className="mr-2" size={18} />
                New Story
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-darkgray"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/gallery" className="text-darkgray hover:text-coral transition-colors font-semibold">
                My Stories
              </Link>
              <Link href="/character-creator" className="text-darkgray hover:text-coral transition-colors font-semibold">
                Characters
              </Link>
              <Link href="/gallery" className="text-darkgray hover:text-coral transition-colors font-semibold">
                Gallery
              </Link>
              <Link href="/character-creator">
                <Button className="bg-coral text-white hover:bg-[#ff5252] transition-colors font-semibold rounded-full">
                  <Wand2 className="mr-2" size={18} />
                  New Story
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
