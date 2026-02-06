import { Home, Calendar, Package, ShoppingCart, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/field', icon: Home, label: 'Home' },
  { path: '/field/meetings', icon: Calendar, label: 'Meetings' },
  { path: '/field/distribution', icon: Package, label: 'Samples' },
  { path: '/field/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/field/profile', icon: User, label: 'Profile' },
];

export function FieldNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border flex justify-around items-center py-2 px-2 z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}>
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path || 
          (path !== '/field' && location.pathname.startsWith(path));
        
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[4rem]',
              isActive 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
