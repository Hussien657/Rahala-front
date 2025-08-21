import { useState } from 'react';
import { Filter, Users, Hash, MapPin, Calendar, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  type?: 'all' | 'users' | 'tags';
  country?: string;
  gender?: 'M' | 'F';
  verified?: boolean;
  minFollowers?: number;
  minTrips?: number;
  sortBy?: 'relevance' | 'popularity' | 'recent';
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      sortBy: 'relevance',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.country) count++;
    if (filters.gender) count++;
    if (filters.verified) count++;
    if (filters.minFollowers) count++;
    if (filters.minTrips) count++;
    if (filters.sortBy && filters.sortBy !== 'relevance') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const countries = [
    'مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان',
    'الأردن', 'لبنان', 'سوريا', 'العراق', 'المغرب', 'الجزائر', 'تونس',
    'ليبيا', 'السودان', 'اليمن', 'فلسطين'
  ];

  return (
    <div className={cn('relative', className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>فلاتر</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">فلاتر البحث</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  مسح الكل
                </Button>
              )}
            </div>

            <DropdownMenuSeparator />

            {/* Search Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                نوع البحث
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'الكل', icon: Filter },
                  { value: 'users', label: 'مستخدمين', icon: Users },
                  { value: 'tags', label: 'تاجز', icon: Hash },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => updateFilter('type', value)}
                    className={cn(
                      'flex flex-col items-center p-2 rounded-lg border text-xs transition-colors',
                      filters.type === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Country Filter (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  البلد
                </label>
                <select
                  value={filters.country || ''}
                  onChange={(e) => updateFilter('country', e.target.value || undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">جميع البلدان</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Gender Filter (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  الجنس
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: undefined, label: 'الكل' },
                    { value: 'M', label: 'ذكر' },
                    { value: 'F', label: 'أنثى' },
                  ].map(({ value, label }) => (
                    <button
                      key={label}
                      onClick={() => updateFilter('gender', value)}
                      className={cn(
                        'p-2 rounded-lg border text-xs transition-colors',
                        filters.gender === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Filter (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.verified || false}
                    onChange={(e) => updateFilter('verified', e.target.checked || undefined)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">المستخدمين الموثقين فقط</span>
                </label>
              </div>
            )}

            {/* Min Followers (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  الحد الأدنى للمتابعين
                </label>
                <select
                  value={filters.minFollowers || ''}
                  onChange={(e) => updateFilter('minFollowers', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">أي عدد</option>
                  <option value="10">10+ متابع</option>
                  <option value="50">50+ متابع</option>
                  <option value="100">100+ متابع</option>
                  <option value="500">500+ متابع</option>
                  <option value="1000">1000+ متابع</option>
                </select>
              </div>
            )}

            {/* Min Trips (for tags) */}
            {filters.type !== 'users' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  الحد الأدنى للرحلات
                </label>
                <select
                  value={filters.minTrips || ''}
                  onChange={(e) => updateFilter('minTrips', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">أي عدد</option>
                  <option value="5">5+ رحلات</option>
                  <option value="10">10+ رحلات</option>
                  <option value="25">25+ رحلات</option>
                  <option value="50">50+ رحلات</option>
                </select>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ترتيب النتائج
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'relevance', label: 'الصلة' },
                  { value: 'popularity', label: 'الشعبية' },
                  { value: 'recent', label: 'الأحدث' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateFilter('sortBy', value)}
                    className={cn(
                      'p-2 rounded-lg border text-xs transition-colors',
                      filters.sortBy === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {filters.type && filters.type !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filters.type === 'users' ? 'مستخدمين' : 'تاجز'}
              <button
                onClick={() => updateFilter('type', 'all')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.country && (
            <Badge variant="secondary" className="text-xs">
              {filters.country}
              <button
                onClick={() => updateFilter('country', undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="text-xs">
              موثق
              <button
                onClick={() => updateFilter('verified', undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFiltersComponent;
