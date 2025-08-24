import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Hash, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import {
  useLazyQuickSearchQuery,
  useLazyGetSearchSuggestionsQuery,
  useGetSearchHistoryQuery,
  useGetPopularSearchesQuery,
  useClearSearchHistoryMutation,
  type SearchResult,
  type SearchSuggestion,
  type SearchHistory,
  type PopularSearch,
  type SearchError
} from '@/store/searchApi';

interface AdvancedSearchProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
  showHistory?: boolean;
  showSuggestions?: boolean;
  showPopular?: boolean;
  maxResults?: number;
  enableRateLimitHandling?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = 'البحث...',
  className = '',
  onResultSelect,
  showHistory = true,
  showSuggestions = true,
  showPopular = true,
  maxResults = 5,
  enableRateLimitHandling = true,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { direction, t } = useLanguage();  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState<SearchError | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // API hooks
  const [triggerQuickSearch, { isLoading: isQuickSearchLoading }] = useLazyQuickSearchQuery();
  const [triggerSuggestions, { isLoading: isSuggestionsLoading }] = useLazyGetSearchSuggestionsQuery();
  const { data: searchHistoryData } = useGetSearchHistoryQuery(undefined, {
    skip: !isAuthenticated || !isSearchFocused || searchQuery.trim().length > 0 || !showHistory,
  });
  const { data: popularSearchesData } = useGetPopularSearchesQuery({ limit: maxResults }, {
    skip: !isSearchFocused || searchQuery.trim().length > 0 || !showPopular,
  });
  const [clearHistory] = useClearSearchHistoryMutation();

  const isSearchLoading = isQuickSearchLoading || isSuggestionsLoading;
  const searchHistory = searchHistoryData?.results?.slice(0, maxResults) || [];
  const popularSearches = popularSearchesData?.popular_searches?.slice(0, maxResults) || [];

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setSuggestions([]);
        setSearchError(null);
        return;
      }

      // Reset error state
      setSearchError(null);
      setIsRateLimited(false);

      try {
        // Quick search for real-time results
        const quickResult = await triggerQuickSearch(query).unwrap();
        setSearchResults(quickResult.quick_results?.slice(0, maxResults) || []);

        // Get suggestions if enabled
        if (showSuggestions) {
          const suggestionsResult = await triggerSuggestions({ query, limit: maxResults }).unwrap();
          setSuggestions(suggestionsResult.suggestions || []);
        }
      } catch (error: any) {
        console.error('Search error:', error);

        // Handle rate limiting
        if (error.status === 429 && enableRateLimitHandling) {
          setIsRateLimited(true);
          setSearchError({
            error: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد قليل.',
            error_code: 'RATE_LIMITED'
          });
        } else if (error.data?.error) {
          // Handle API errors
          setSearchError({
            error: error.data.error,
            error_code: error.data.error_code || 'UNKNOWN_ERROR'
          });
        } else {
          // Handle network errors
          setSearchError({
            error: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
            error_code: 'NETWORK_ERROR'
          });
        }

        setSearchResults([]);
        setSuggestions([]);
      }
    }, 300),
    [triggerQuickSearch, triggerSuggestions, maxResults, showSuggestions, enableRateLimitHandling]
  );

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setSuggestions([]);
    }
  }, [searchQuery, debouncedSearch]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearchDropdown(false);
      setIsSearchFocused(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      if (result.type === 'user') {
        navigate(`/profile/${result.id}`);
      } else if (result.type === 'tag') {
        navigate(`/explore/tag/${result.name}`);
      }
    }
    setSearchQuery('');
    setShowSearchDropdown(false);
    setIsSearchFocused(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSearchDropdown(false);
    if (suggestion.type === 'user' && suggestion.user_id) {
      navigate(`/profile/${suggestion.user_id}`);
    } else if (suggestion.type === 'tag') {
      navigate(`/explore/tag/${suggestion.text}`);
    }
  };

  const handleHistoryClick = (historyItem: SearchHistory) => {
    setSearchQuery(historyItem.query);
    setShowSearchDropdown(false);
    navigate(`/search?q=${encodeURIComponent(historyItem.query)}`);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSearchDropdown(true);
  };

  const handleClearHistory = async () => {
    try {
      const result = await clearHistory().unwrap();
      console.log(`تم مسح ${result.deleted_count} عنصر من تاريخ البحث`);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const handlePopularSearchClick = (popularSearch: PopularSearch) => {
    setSearchQuery(popularSearch.query);
    setShowSearchDropdown(false);
    navigate(`/search?q=${encodeURIComponent(popularSearch.query)}`);
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          dir={direction}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Search Dropdown */}
      {showSearchDropdown && (
        <div
          ref={searchDropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {isSearchLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <span className="mt-2 block">جاري البحث...</span>
            </div>
          )}

          {/* Error State */}
          {searchError && (
            <div className="p-4 text-center">
              <div className={`p-3 rounded-lg ${
                searchError.error_code === 'RATE_LIMITED'
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="font-medium mb-1">
                  {searchError.error_code === 'RATE_LIMITED' ? '⚠️ تحذير' : '❌ خطأ'}
                </div>
                <div className="text-sm">{searchError.error}</div>
                {isRateLimited && (
                  <div className="text-xs mt-2 opacity-75">
                    الحد المسموح: 120 طلب/دقيقة للبحث السريع
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                نتائج البحث
              </div>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${index}`}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                  onClick={() => handleResultClick(result)}
                >
                  {result.type === 'user' ? (
                    <>
                      <div className="flex-shrink-0">
                        {result.avatar ? (
                          <img
                            src={result.avatar}
                            alt={result.display_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.display_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          @{result.username} • {result.followers_count} متابع
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Hash className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.display_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {result.trips_count} رحلة
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && searchQuery.trim() && showSuggestions && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                <TranslatableText staticKey="search.suggestions" fallback="Suggestions">اقتراحات</TranslatableText>
              </div>
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex-shrink-0">
                    {suggestion.type === 'user' ? (
                      <User className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Hash className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 truncate">
                      {suggestion.display_text}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery.trim() && showHistory && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 flex items-center justify-between">
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  <Clock className="h-4 w-4" />
                  <span><TranslatableText staticKey="search.recentSearches" fallback="Recent Searches">البحثات الأخيرة</TranslatableText></span>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <TranslatableText staticKey="search.clearAll" fallback="Clear All">مسح الكل</TranslatableText>
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{item.query}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.results_count} <TranslatableText staticKey="search.results" fallback="results">نتيجة</TranslatableText>

                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && !searchQuery.trim() && showPopular && !searchHistory.length && (
            <div>
              <div className={`px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                <TrendingUp className="h-4 w-4" />
                <span><TranslatableText staticKey="search.popularSearches" fallback="Popular Searches">البحثات الشائعة</TranslatableText></span>
              </div>
              {popularSearches.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handlePopularSearchClick(item)}
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-900">{item.query}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {item.search_count} <TranslatableText staticKey="search.searchCount" fallback="searches">بحث</TranslatableText>
                    </span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isSearchLoading && searchQuery.trim() && searchResults.length === 0 && searchSuggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <div>لا توجد نتائج لـ "{searchQuery}"</div>
              <div className="text-sm mt-1">جرب كلمات مختلفة أو تحقق من الإملاء</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
