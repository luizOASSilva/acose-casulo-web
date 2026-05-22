'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Heart, X, Menu, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

import { cn } from '@/lib/cn';
import { useModalEffects } from '@/hooks/useModalEffects';
import { usePublicSettings } from '@/context/PublicSettingsContext';
import { isDonationEnabled } from '@/services/public-settings';

interface Article {
  id: string | number;
  title: string;
  slug: string;
}

const links = [
  { href: '/', label: 'Home' },
  { href: '/parceiros', label: 'Parceiros' },
  { href: '/transparencia', label: 'Transparência' },
  { href: '/nossa-historia', label: 'Nossa história' },
  { href: '/atividades', label: 'Atividades' },
];

export default function NavbarClient({
  recentArticles,
}: {
  recentArticles: Article[];
}) {
  const { settings } = usePublicSettings();

  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(80);
  const [hidden, setHidden] = useState(false);

  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  const logoUrl = settings.site_logo_url || '/logo.svg';
  const donationIsEnabled = isDonationEnabled(settings);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    if (open) {
      setHidden(false);
      return;
    }

    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    if (!headerRef.current) return;

    const observer = new ResizeObserver(() => {
      setNavbarHeight(headerRef.current?.offsetHeight ?? 80);
    });

    observer.observe(headerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  useModalEffects(open, () => setOpen(false));

  const closeMenus = () => {
    setOpen(false);
    setDropdownOpen(false);
  };

  const isDesktop = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(min-width: 1024px)').matches;

  return (
    <>
      {open && (
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMenus}
        />
      )}

      <motion.header
        ref={headerRef}
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-50 w-full border-b border-gray-200 bg-white"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link
            href="/"
            className="flex shrink-0"
            onClick={closeMenus}
            aria-label="Ir para a página inicial da Acose Casulo"
          >
            <Image
              src={logoUrl}
              alt="Acose Casulo"
              width={100}
              height={40}
              priority
              className="h-auto w-auto max-w-[100px]"
            />
          </Link>

          <button
            type="button"
            className="cursor-pointer p-2 text-gray-700 lg:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>

          <nav
            id="main-nav"
            aria-label="Navegação principal"
            style={{
              maxHeight: open ? `calc(100dvh - ${navbarHeight}px)` : undefined,
            }}
            className={cn(
              'absolute left-0 top-full w-full flex-col gap-0 border-b border-gray-200 bg-white transition-all duration-300',
              'overflow-y-auto overflow-x-hidden',
              'lg:static lg:ml-auto lg:flex lg:max-h-none lg:w-auto lg:flex-row lg:items-center lg:gap-0 lg:overflow-visible lg:border-0 lg:p-0',
              open ? 'flex visible opacity-100' : 'hidden lg:flex'
            )}
          >
            <ul className="flex w-full flex-col lg:w-auto lg:flex-row lg:items-center lg:gap-8 lg:p-0">
              {links.map(({ href, label }) => (
                <li key={href} className="w-full lg:w-auto">
                  <Link
                    href={href}
                    onClick={closeMenus}
                    aria-current={pathname === href ? 'page' : undefined}
                    className={cn(
                      'block w-full px-6 py-4 text-sm font-semibold transition-colors hover:text-primary lg:px-0 lg:py-0',
                      pathname === href ? 'text-primary' : 'text-gray-600'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}

              <li
                className="relative w-full lg:w-auto"
                onMouseEnter={() => isDesktop() && setDropdownOpen(true)}
                onMouseLeave={() => isDesktop() && setDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => !isDesktop() && setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-controls="artigos-dropdown"
                  aria-label={
                    dropdownOpen
                      ? 'Fechar submenu de artigos'
                      : 'Abrir submenu de artigos'
                  }
                  className={cn(
                    'flex w-full items-center justify-between gap-1 px-6 py-4 text-sm font-semibold transition-colors hover:text-primary lg:w-auto lg:cursor-default lg:px-0 lg:py-0',
                    pathname.includes('/artigos')
                      ? 'text-primary'
                      : 'text-gray-600'
                  )}
                >
                  Artigos

                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn(
                      'transition-transform duration-200',
                      dropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                <div
                  id="artigos-dropdown"
                  className={cn(
                    'z-50 w-full transition-all lg:absolute lg:left-0 lg:top-full lg:w-80 lg:pt-4',
                    dropdownOpen
                      ? 'visible block opacity-100'
                      : 'hidden opacity-0 lg:invisible'
                  )}
                >
                  <ul
                    className="bg-white lg:mt-0 lg:rounded-xl lg:border lg:border-gray-100 lg:shadow-xl"
                    aria-label="Artigos recentes"
                  >
                    {recentArticles.map((article) => (
                      <li key={article.id} className="w-full">
                        <Link
                          href={`/artigos/${article.slug}`}
                          onClick={closeMenus}
                          className="block w-full border-l-4 border-transparent px-6 py-4 text-[13px] font-medium text-gray-700 transition-all hover:border-primary hover:bg-orange-50/40 lg:px-5"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}

                    <li className="w-full">
                      <Link
                        href="/artigos"
                        onClick={closeMenus}
                        className="block w-full border-t border-gray-100 bg-orange-50/60 px-6 py-4 text-center text-sm font-bold text-primary transition-colors hover:bg-orange-100 lg:px-5"
                      >
                        Mostrar todos os artigos
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              <li className="w-full lg:w-auto">
                <Link
                  href="/contato"
                  onClick={closeMenus}
                  aria-current={pathname === '/contato' ? 'page' : undefined}
                  className={cn(
                    'block w-full px-6 py-4 text-sm font-semibold transition-colors hover:text-primary lg:px-0 lg:py-0',
                    pathname === '/contato' ? 'text-primary' : 'text-gray-600'
                  )}
                >
                  Contato
                </Link>
              </li>
            </ul>

            {donationIsEnabled && (
              <div className="px-6 py-5 lg:ml-8 lg:px-0 lg:py-0">
                <Link
                  href="/doe-agora"
                  onClick={closeMenus}
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white active:scale-95',
                    pathname === '/doe-agora' && 'bg-primary text-white'
                  )}
                >
                  <Heart size={15} fill="currentColor" aria-hidden="true" />
                  Doe agora
                </Link>
              </div>
            )}
          </nav>
        </div>
      </motion.header>
    </>
  );
}
