import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PromoBanner {
  id: string;
  image: string;
  alt: string;
}

const promoBanners: PromoBanner[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1648260029310-5f1da359af9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjE0NDU0NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Discover unforgettable live events',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1675972418297-29d4e440d63b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBtdXNpYyUyMGZlc3RpdmFsfGVufDF8fHx8MTc2MTQ3MTM0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Summer festival season',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1494436567119-7f392017bb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwc3RhZ2UlMjBicm9hZHdheXxlbnwxfHx8fDE3NjE0NzEzNDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Theater and performing arts',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1760582912320-79fcbc9f309b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21lZHklMjBzaG93JTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzYxMzkwODI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Live comedy performances',
  },
];

export function PromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoBanners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoBanners.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promoBanners.length) % promoBanners.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Promotional Banner Carousel - Responsive Aspect Ratio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div 
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden glass border border-[var(--border-glass)]" 
            style={{ aspectRatio: '2/1' }}
          >
            <style>{`
              @media (min-width: 641px) {
                .relative[style*="aspectRatio"] { 
                  aspect-ratio: 5/1 !important; 
                }
              }
            `}</style>
            {/* Banner Images */}
            <AnimatePresence mode="wait">
              {promoBanners.map((banner, index) => (
                index === currentSlide && (
                  <motion.div
                    key={banner.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                  >
                    <ImageWithFallback
                      src={banner.image}
                      alt={banner.alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.button
              onClick={prevSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-smooth focus-ring rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-black/30 hover:bg-black/50 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            <motion.button
              onClick={nextSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-smooth focus-ring rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-black/30 hover:bg-black/50 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {promoBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all focus-ring ${
                    index === currentSlide 
                      ? 'w-6 sm:w-8 bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)]' 
                      : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
