import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
}

export function SEOHead({
  title = 'Eventix - Premium Online Ticketing Platform',
  description = 'Discover and book tickets to concerts, festivals, theater, and live entertainment. Your premier destination for event tickets in Indonesia.',
  keywords = 'tickets, events, concerts, festivals, theater, live entertainment, Indonesia, Jakarta, booking',
  image = '/og-image.png',
  type = 'website',
}: SEOHeadProps) {
  const location = useLocation();
  const url = `https://eventix.example.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const attribute = name ? 'name' : 'property';
      const value = name || property;
      
      if (!value) return;

      let element = document.querySelector(`meta[${attribute}="${value}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });
  }, [title, description, keywords, image, url, type]);

  return null;
}
