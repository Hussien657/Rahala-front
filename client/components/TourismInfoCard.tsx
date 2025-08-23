import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, Clock, AlertTriangle, Lightbulb, Globe, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TourismInfo {
  description: string;
  recommended_places: string[];
  warnings: string[];
  best_time_to_visit: string;
  local_tips: string[];
  currency: string;
  language: string;
}

interface TourismInfoCardProps {
  tourismInfo: TourismInfo;
  country?: string;
  city?: string;
}

const TourismInfoCard: React.FC<TourismInfoCardProps> = ({ 
  tourismInfo, 
  country, 
  city 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { direction, t } = useLanguage();

  if (!tourismInfo) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center">
            <Globe className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {city && country ? `${city}, ${country}` : 'معلومات سياحية'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:text-yellow-300 hover:bg-white/20"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0">
        {/* Description */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed bg-white/10 p-3 rounded-lg">
            {tourismInfo.description}
          </p>
        </div>

        {isExpanded && (
          <>
            {/* Recommended Places */}
            {tourismInfo.recommended_places && tourismInfo.recommended_places.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <MapPin className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  أماكن مقترحة للزيارة
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tourismInfo.recommended_places.map((place, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                      {place}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {tourismInfo.warnings && tourismInfo.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center text-yellow-200">
                  <AlertTriangle className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  تحذيرات مهمة
                </h4>
                <div className="space-y-2">
                  {tourismInfo.warnings.map((warning, index) => (
                    <div key={index} className="bg-yellow-500/20 p-2 rounded-lg border-l-4 border-yellow-300">
                      <p className="text-sm">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-xs text-gray-200">العملة</div>
                <div className="text-sm font-semibold">{tourismInfo.currency}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🗣️</div>
                <div className="text-xs text-gray-200">اللغة</div>
                <div className="text-sm font-semibold">{tourismInfo.language}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-xs text-gray-200">أفضل وقت</div>
                <div className="text-sm font-semibold">{tourismInfo.best_time_to_visit}</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-gray-200">الأماكن</div>
                <div className="text-sm font-semibold">
                  {tourismInfo.recommended_places?.length || 0}
                </div>
              </div>
            </div>

            {/* Local Tips */}
            {tourismInfo.local_tips && tourismInfo.local_tips.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center text-green-200">
                  <Lightbulb className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  نصائح محلية
                </h4>
                <div className="space-y-2">
                  {tourismInfo.local_tips.map((tip, index) => (
                    <div key={index} className="bg-green-500/20 p-2 rounded-lg border-l-4 border-green-300">
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TourismInfoCard;
