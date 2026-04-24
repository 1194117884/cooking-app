'use client';

import {
  Home,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  User,
  Users,
  Lock,
  Sparkles,
  Plus,
  ChefHat,
  UtensilsCrossed,
  Carrot,
  Beef,
  Fish,
  Wheat,
  Flame,
  Apple,
  Milk,
  Package,
  Search,
  Star,
  Clock,
  Users as UsersIcon,
  Flame as FlameIcon,
  Heart,
  MoreVertical,
  Edit,
  Trash2,
  X,
  ChevronRight,
  Check,
  AlertCircle,
  LogOut,
  Leaf,
  LayoutGrid,
  List,
  CalendarDays,
  ArrowRight,
  Loader2,
  RotateCcw,
  Eye,
  TrendingUp,
  Target,
  Palette,
  Crown,
  Baby,
  Smile,
  type LucideIcon,
} from 'lucide-react';

// Navigation Icons
export const NavIcons = {
  home: Home,
  recipes: BookOpen,
  planner: Calendar,
  shopping: ShoppingCart,
  settings: Settings,
  members: Users,
};

// Action Icons
export const ActionIcons = {
  add: Plus,
  edit: Edit,
  delete: Trash2,
  search: Search,
  close: X,
  check: Check,
  more: MoreVertical,
  arrowRight: ArrowRight,
  refresh: RotateCcw,
  view: Eye,
  logout: LogOut,
  loading: Loader2,
};

// Content Icons
export const ContentIcons = {
  chefHat: ChefHat,
  utensils: UtensilsCrossed,
  star: Star,
  heart: Heart,
  clock: Clock,
  users: UsersIcon,
  flame: FlameIcon,
  sparkles: Sparkles,
  trendingUp: TrendingUp,
  target: Target,
  palette: Palette,
  layoutGrid: LayoutGrid,
  list: List,
  calendarDays: CalendarDays,
  alert: AlertCircle,
};

// Category Icons for ingredients
export const CategoryIcons: Record<string, LucideIcon> = {
  VEGETABLE: Carrot,
  MEAT: Beef,
  SEAFOOD: Fish,
  GRAIN: Wheat,
  SEASONING: Flame,
  FRUIT: Apple,
  DAIRY: Milk,
  OTHER: Package,
};

// Role Icons
export const RoleIcons = {
  adult: User,
  child: Baby,
  elder: Smile,
  crown: Crown,
  leaf: Leaf,
};

// Meal Type Icons
export const MealIcons = {
  breakfast: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  lunch: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  ),
  dinner: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
};

// Icon wrapper with default props
export function createIconComponent(Icon: LucideIcon) {
  return function IconComponent({
    size = 20,
    className = '',
    ...props
  }: {
    size?: number;
    className?: string;
  } & React.ComponentProps<LucideIcon>) {
    return <Icon size={size} className={className} {...props} />;
  };
}

// Default export for common icons
export {
  Home,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  User,
  Plus,
  Search,
  Star,
  Clock,
  Heart,
  Flame,
  ChefHat,
  ArrowRight,
  Check,
  X,
  Loader2,
};
