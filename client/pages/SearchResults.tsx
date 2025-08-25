import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, Hash, ArrowLeft, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import SearchFiltersComponent, { type SearchFilters } from '@/components/SearchFilters';
import SearchStats from '@/components/SearchStats';
import {
  useUnifiedSearchQuery,
  useSearchUsersQuery,
  useSearchTagsQuery,
  type SearchResult
} from '@/store/searchApi';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sortBy: 'relevance',
  });
  const { t, direction } = useLanguage();

  // API queries
  const { data: unifiedData, isLoading: isUnifiedLoading, error: unifiedError } = useUnifiedSearchQuery(query, {
    skip: !query || activeTab !== 'all',
  });

  const { data: usersData, isLoading: isUsersLoading } = useSearchUsersQuery(
    { query, page: 1, pageSize: 20 },
    { skip: !query || activeTab !== 'users' }
  );

  const { data: tagsData, isLoading: isTagsLoading } = useSearchTagsQuery(
    { query, page: 1, pageSize: 20 },
    { skip: !query || activeTab !== 'tags' }
  );

  const isLoading = isUnifiedLoading || isUsersLoading || isTagsLoading;

  useEffect(() => {
    if (query) {
      document.title = `${t('searchResults.searchResultsFor', 'Search results for')} "${query}" - RAHALA`;
    }
  }, [query, t]);

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20" dir={direction}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              <TranslatableText staticKey="searchResults.title">Search for anything</TranslatableText>
            </h1>
            <p className="text-gray-600">
              <TranslatableText staticKey="searchResults.subtitle">Use the search bar above to find users and tags</TranslatableText>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderUserResult = (user: any) => (
    <Link
      key={user.id}
      to={`/profile/${user.id}`}
      className={`
        block p-4 bg-white rounded-lg border hover:border-primary/50 hover:shadow-md transition-all duration-200
        ${user.subscription_status?.has_verified_badge
          ? 'border-2 border-yellow-500 animate-glow'
          : 'border-gray-200'
        }
      `}
    >
      <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
        <Avatar className={`
          h-12 w-12
          ${user.subscription_status?.has_verified_badge
            ? 'border-2 border-yellow-500 animate-glow-avatar'
            : 'border-gray-200'
          }
        `}>
          <AvatarImage src={user.profile?.avatar} alt={user.profile?.first_name} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
            <h3 className="font-semibold text-gray-900 truncate">
              {user.profile?.first_name} {user.profile?.last_name}
            </h3>
            {user.is_verified && (
              <Badge variant="outline" className="text-xs">
                <TranslatableText staticKey="searchResults.verified">Verified</TranslatableText>
              </Badge>
            )}
            {user.subscription_status?.has_verified_badge && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 text-xs">
                <TranslatableText staticKey="searchResults.premium">Premium</TranslatableText>
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">@{user.username}</p>
          <p className="text-sm text-gray-500">
            {user.followers_count} {user.followers_count === 1 ?
              t('searchResults.followers', 'follower') :
              t('searchResults.followers', 'followers')
            }
          </p>
          {user.profile?.bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.profile.bio}</p>
          )}
        </div>
      </div>
    </Link>
  );

  const renderTagResult = (tag: any) => (
    <Link
      key={tag.tripTag}
      to={`/trip/${tag.id}`}
      className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-200"
    >
      <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Hash className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">#{tag.caption}</h3>
          <p className="text-sm text-gray-500">
            {tag.trips_count} {tag.trips_count === 1 ?
              t('searchResults.trip', 'trip') :
              t('searchResults.trips', 'trips')
            }
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir={direction}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="mb-8">
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4 mb-4`}>
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('searchResults.searchResultsFor', 'Search results for')} "{query}"
                  </h1>
                  {unifiedData && (
                    <p className="text-gray-600 mt-1">
                      {unifiedData.total_results} {unifiedData.total_results === 1 ?
                        t('searchResults.results', 'result') :
                        t('searchResults.results', 'results')
                      } ({unifiedData.users_count} {unifiedData.users_count === 1 ?
                        t('searchResults.users', 'user') :
                        t('searchResults.users', 'users')
                      }، {unifiedData.tags_count} {unifiedData.tags_count === 1 ?
                        t('searchResults.tags', 'tag') :
                        t('searchResults.tags', 'tags')
                      })
                    </p>
                  )}
                </div>
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  <SearchFiltersComponent
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 border rounded-lg p-1`}>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="all">
                    <TranslatableText staticKey="searchResults.all">All</TranslatableText>
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    <TranslatableText staticKey="searchResults.usersTab">Users</TranslatableText>
                  </TabsTrigger>
                  <TabsTrigger value="tags">
                    <TranslatableText staticKey="searchResults.tagsTab">Tags</TranslatableText>
                  </TabsTrigger>
                </TabsList>

                {isLoading && (
                  <div className="mt-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">
                      <TranslatableText staticKey="searchResults.searching">Searching...</TranslatableText>
                    </p>
                  </div>
                )}

                {unifiedError && (
                  <div className="mt-8 text-center">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      <TranslatableText staticKey="searchResults.searchError">Search error occurred</TranslatableText>
                    </h3>
                    <p className="text-gray-600">
                      <TranslatableText staticKey="searchResults.pleaseRetry">Please try again</TranslatableText>
                    </p>
                  </div>
                )}

                <TabsContent value="all" className="mt-6">
                  {unifiedData && unifiedData.results.length > 0 ? (
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {unifiedData.results.map((result: SearchResult, index: number) => (
                        <div key={index}>
                          {result.type === 'user' ? renderUserResult(result) : renderTagResult(result)}
                        </div>
                      ))}
                    </div>
                  ) : !isLoading && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        <TranslatableText staticKey="searchResults.noResults">No results</TranslatableText>
                      </h3>
                      <p className="text-gray-600">
                        <TranslatableText staticKey="searchResults.tryDifferentWords">Try different words or check spelling</TranslatableText>
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                  {usersData && usersData.results.length > 0 ? (
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {usersData.results.map(renderUserResult)}
                    </div>
                  ) : !isLoading && (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        <TranslatableText staticKey="searchResults.noUsers">No users</TranslatableText>
                      </h3>
                      <p className="text-gray-600">
                        <TranslatableText staticKey="searchResults.noUsersFound">We didn't find any users with this name</TranslatableText>
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tags" className="mt-6">
                  {tagsData && tagsData.results.length > 0 ? (
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {tagsData.results.map(renderTagResult)}
                    </div>
                  ) : !isLoading && (
                    <div className="text-center py-12">
                      <Hash className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        <TranslatableText staticKey="searchResults.noTags">No tags</TranslatableText>
                      </h3>
                      <p className="text-gray-600">
                        <TranslatableText staticKey="searchResults.noTagsFound">We didn't find any tags with this name</TranslatableText>
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-1">
            <SearchStats
              query={query}
              totalResults={unifiedData?.total_results}
              usersCount={unifiedData?.users_count}
              tagsCount={unifiedData?.tags_count}
              className="sticky top-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;