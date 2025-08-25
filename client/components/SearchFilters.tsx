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
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from './TranslatableText';

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
  const { direction, t } = useLanguage();
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

  const countries = t('searchFilters.countries', [
    'Egypt', 'Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain', 'Oman',
    'Jordan', 'Lebanon', 'Syria', 'Iraq', 'Morocco', 'Algeria', 'Tunisia',
    'Libya', 'Sudan', 'Yemen', 'Palestine'
  ]);

  return (
    <div className={cn('relative', className)} dir={direction}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}
          >
            <Filter className="h-4 w-4" />
            <TranslatableText staticKey="searchFilters.filters">Filters</TranslatableText>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 p-4" align={direction === 'rtl' ? 'start' : 'end'}>
          <div className="space-y-4">
            {/* Header */}
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
              <h3 className="font-medium text-gray-900">
                <TranslatableText staticKey="searchFilters.searchFilters">Search Filters</TranslatableText>
              </h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <TranslatableText staticKey="searchFilters.clearAll">Clear All</TranslatableText>
                </Button>
              )}
            </div>

            <DropdownMenuSeparator />

            {/* Search Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <TranslatableText staticKey="searchFilters.searchType">Search Type</TranslatableText>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', key: 'searchFilters.typeAll', label: 'All', icon: Filter },
                  { value: 'users', key: 'searchFilters.typeUsers', label: 'Users', icon: Users },
                  { value: 'tags', key: 'searchFilters.typeTags', label: 'Tags', icon: Hash },
                ].map(({ value, key, label, icon: Icon }) => (
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
                    <TranslatableText staticKey={key}>{label}</TranslatableText>
                  </button>
                ))}
              </div>
            </div>

            {/* Country Filter (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <TranslatableText staticKey="searchFilters.country">Country</TranslatableText>
                </label>
                <select
                  value={filters.country || ''}
                  onChange={(e) => updateFilter('country', e.target.value || undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">
                    <TranslatableText staticKey="searchFilters.allCountries">All Countries</TranslatableText>
                  </option>
                  {countries.map((country, index) => (
                    <option key={index} value={country}>
                      <TranslatableText staticKey={`searchFilters.countries.${index}`}>{country}</TranslatableText>
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Gender Filter (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <TranslatableText staticKey="searchFilters.gender">Gender</TranslatableText>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: undefined, key: 'searchFilters.genderAll', label: 'All' },
                    { value: 'M', key: 'searchFilters.genderMale', label: 'Male' },
                    { value: 'F', key: 'searchFilters.genderFemale', label: 'Female' },
                  ].map(({ value, key, label }) => (
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
                      <TranslatableText staticKey={key}>{label}</TranslatableText>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Filter (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  <input
                    type="checkbox"
                    checked={filters.verified || false}
                    onChange={(e) => updateFilter('verified', e.target.checked || undefined)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    <TranslatableText staticKey="searchFilters.verifiedOnly">Verified Users Only</TranslatableText>
                  </span>
                </label>
              </div>
            )}

            {/* Min Followers (for users) */}
            {filters.type !== 'tags' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <TranslatableText staticKey="searchFilters.minFollowers">Minimum Followers</TranslatableText>
                </label>
                <select
                  value={filters.minFollowers || ''}
                  onChange={(e) => updateFilter('minFollowers', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">
                    <TranslatableText staticKey="searchFilters.anyNumber">Any Number</TranslatableText>
                  </option>
                  {[
                    { value: 10, key: 'searchFilters.followers10', label: '10+ followers' },
                    { value: 50, key: 'searchFilters.followers50', label: '50+ followers' },
                    { value: 100, key: 'searchFilters.followers100', label: '100+ followers' },
                    { value: 500, key: 'searchFilters.followers500', label: '500+ followers' },
                    { value: 1000, key: 'searchFilters.followers1000', label: '1000+ followers' },
                  ].map(({ value, key, label }) => (
                    <option key={value} value={value}>
                      <TranslatableText staticKey={key}>{label}</TranslatableText>
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Min Trips (for tags) */}
            {filters.type !== 'users' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <TranslatableText staticKey="searchFilters.minTrips">Minimum Trips</TranslatableText>
                </label>
                <select
                  value={filters.minTrips || ''}
                  onChange={(e) => updateFilter('minTrips', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">
                    <TranslatableText staticKey="searchFilters.anyNumber">Any Number</TranslatableText>
                  </option>
                  {[
                    { value: 5, key: 'searchFilters.trips5', label: '5+ trips' },
                    { value: 10, key: 'searchFilters.trips10', label: '10+ trips' },
                    { value: 25, key: 'searchFilters.trips25', label: '25+ trips' },
                    { value: 50, key: 'searchFilters.trips50', label: '50+ trips' },
                  ].map(({ value, key, label }) => (
                    <option key={value} value={value}>
                      <TranslatableText staticKey={key}>{label}</TranslatableText>
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <TranslatableText staticKey="searchFilters.sortBy">Sort By</TranslatableText>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'relevance', key: 'searchFilters.sortRelevance', label: 'Relevance' },
                  { value: 'popularity', key: 'searchFilters.sortPopularity', label: 'Popularity' },
                  { value: 'recent', key: 'searchFilters.sortRecent', label: 'Recent' },
                ].map(({ value, key, label }) => (
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
                    <TranslatableText staticKey={key}>{label}</TranslatableText>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className={`flex flex-wrap gap-1 mt-2 ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
          {filters.type && filters.type !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              <TranslatableText staticKey={`searchFilters.type${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}`}>
                {filters.type === 'users' ? 'Users' : 'Tags'}
              </TranslatableText>
              <button
                onClick={() => updateFilter('type', 'all')}
                className={`ml-1 hover:text-red-600 ${direction === 'rtl' ? 'mr-1 ml-0' : ''}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.country && (
            <Badge variant="secondary" className="text-xs">
              <TranslatableText staticKey={`searchFilters.countries.${countries.indexOf(filters.country)}`}>
                {filters.country}
              </TranslatableText>
              <button
                onClick={() => updateFilter('country', undefined)}
                className={`ml-1 hover:text-red-600 ${direction === 'rtl' ? 'mr-1 ml-0' : ''}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="text-xs">
              <TranslatableText staticKey="searchFilters.verified">Verified</TranslatableText>
              <button
                onClick={() => updateFilter('verified', undefined)}
                className={`ml-1 hover:text-red-600 ${direction === 'rtl' ? 'mr-1 ml-0' : ''}`}
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