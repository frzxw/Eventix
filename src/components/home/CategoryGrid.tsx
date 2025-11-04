import { Music, Theater, Laugh, Mic2, Calendar, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'concert',
    name: 'Concerts',
    icon: Music,
    gradient: 'from-[var(--primary-500)] to-[var(--primary-600)]',
    description: 'Live music performances',
  },
  {
    id: 'festival',
    name: 'Festivals',
    icon: Sparkles,
    gradient: 'from-[var(--accent-500)] to-[var(--accent-600)]',
    description: 'Multi-day events',
  },
  {
    id: 'theater',
    name: 'Theater',
    icon: Theater,
    gradient: 'from-purple-500 to-purple-600',
    description: 'Plays and musicals',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    icon: Laugh,
    gradient: 'from-orange-500 to-orange-600',
    description: 'Stand-up shows',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: Calendar,
    gradient: 'from-green-500 to-green-600',
    description: 'Athletic events',
  },
  {
    id: 'conference',
    name: 'Conferences',
    icon: Mic2,
    gradient: 'from-blue-500 to-blue-600',
    description: 'Professional events',
  },
];

interface CategoryGridProps {
  onCategoryClick?: (categoryId: string) => void;
}

export function CategoryGrid({ onCategoryClick }: CategoryGridProps) {
  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Browse by Category
          </h2>
          <p className="text-[var(--text-secondary)]">
            Find events that match your interests
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryClick?.(category.id)}
                className="group relative glass rounded-2xl p-4 sm:p-6 border border-[var(--border-glass)] transition-smooth hover:border-[var(--border-glass-hover)] focus-ring overflow-hidden"
                aria-label={`Browse ${category.name} events`}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-smooth pointer-events-none" 
                     style={{ backgroundImage: `linear-gradient(to bottom right, var(--primary-500), var(--accent-500))` }} 
                />

                {/* Content */}
                <div className="relative flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  {/* Icon container with gradient */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-smooth`} />
                    <div className={`relative bg-gradient-to-br ${category.gradient} p-3 sm:p-4 rounded-xl`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Category name */}
                  <div>
                    <h3 className="text-sm sm:text-base" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {category.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 hidden sm:block">
                      {category.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
