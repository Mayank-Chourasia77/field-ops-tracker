import { ReactNode } from 'react';
import { FieldNavigation } from './FieldNavigation';

interface FieldLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
}

export function FieldLayout({ children, title, showNav = true }: FieldLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {title && (
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground py-4 shadow-md" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
          <div className="app-container">
            <h1 className="text-xl font-bold text-center">{title}</h1>
          </div>
        </header>
      )}
      <main className={showNav ? 'pb-24' : ''}>
        <div className="app-container">
          {children}
        </div>
      </main>
      {showNav && <FieldNavigation />}
    </div>
  );
}
