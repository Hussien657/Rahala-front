import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Hash, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useGetPopularSearchesQuery } from '@/store/searchApi';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from './TranslatableText';

interface SearchStatsProps {
  query?: string;
  totalResults?: number;
  usersCount?: number;
  tagsCount?: number;
  searchTime?: number;
  className?: string;
}

const SearchStats: React.FC<SearchStatsProps> = ({
  query,
  totalResults = 0,
  usersCount = 0,
  tagsCount = 0,
  searchTime,
  className = '',
}) => {
  const { direction, t } = useLanguage();
  const [showStats, setShowStats] = useState(false);
  const { data: popularSearches } = useGetPopularSearchesQuery({ limit: 5 });

  useEffect(() => {
    if (query && totalResults > 0) {
      setShowStats(true);
    }
  }, [query, totalResults]);

  if (!showStats && !popularSearches) return null;

  return (
    <div className={`space-y-4 ${className}`} dir={direction}>
      {/* Search Results Stats */}
      {showStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
              <BarChart3 className="h-5 w-5" />
              <span>
                <TranslatableText staticKey="searchStats.title">Search Statistics</TranslatableText>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Results */}
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalResults}</div>
                <div className="text-sm text-blue-800">
                  <TranslatableText staticKey="searchStats.totalResults">Total Results</TranslatableText>
                </div>
              </div>

              {/* Users Count */}
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{usersCount}</div>
                <div className={`text-sm text-green-800 flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                  <Users className="h-3 w-3" />
                  <span>
                    <TranslatableText staticKey="searchStats.users">Users</TranslatableText>
                  </span>
                </div>
              </div>

              {/* Tags Count */}
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{tagsCount}</div>
                <div className={`text-sm text-purple-800 flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                  <Hash className="h-3 w-3" />
                  <span>
                    <TranslatableText staticKey="searchStats.tags">Tags</TranslatableText>
                  </span>
                </div>
              </div>

              {/* Search Time */}
              {searchTime && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {searchTime.toFixed(2)}
                  </div>
                  <div className={`text-sm text-orange-800 flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                    <Clock className="h-3 w-3" />
                    <span>
                      <TranslatableText staticKey="searchStats.seconds">seconds</TranslatableText>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Search Query Info */}
            {query && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 text-sm text-gray-600`}>
                  <Search className="h-4 w-4" />
                  <span>
                    <TranslatableText staticKey="searchStats.searchingFor">Searching for:</TranslatableText>
                  </span>
                  <Badge variant="outline" className="font-mono">
                    "{query}"
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {popularSearches && popularSearches.popular_searches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
              <TrendingUp className="h-5 w-5" />
              <span>
                <TranslatableText staticKey="searchStats.popularSearches">Popular Searches</TranslatableText>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularSearches.popular_searches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    window.location.href = `/search?q=${encodeURIComponent(search.query)}`;
                  }}
                >
                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{search.query}</div>
                      <div className="text-sm text-gray-500">
                        <TranslatableText staticKey="searchStats.lastSearched">Last searched:</TranslatableText> {new Date(search.last_searched).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US')}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                    <Badge variant="secondary" className="text-xs">
                      {search.search_count} {search.search_count === 1 ?
                        t('searchStats.searches', 'search') :
                        t('searchStats.searches', 'searches')
                      }
                    </Badge>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}

              {/* Total Popular Searches Count */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                  <TranslatableText staticKey="searchStats.totalPopularSearches">Total popular searches:</TranslatableText> {popularSearches.total_count}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={`text-lg flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
            <Search className="h-5 w-5" />
            <span>
              <TranslatableText staticKey="searchStats.searchTips">Search Tips</TranslatableText>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className={`flex items-start ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>
                  <TranslatableText staticKey="searchStats.userSearchTip">Search in users: Use username or real name</TranslatableText>
                </strong>
              </div>
            </div>
            <div className={`flex items-start ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>
                  <TranslatableText staticKey="searchStats.tagSearchTip">Search in tags: Use hashtag or tag name</TranslatableText>
                </strong>
              </div>
            </div>
            <div className={`flex items-start ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>
                  <TranslatableText staticKey="searchStats.combinedSearchTip">Combined search: Mix users and tags for better results</TranslatableText>
                </strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchStats;