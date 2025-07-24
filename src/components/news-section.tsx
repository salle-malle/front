"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Newspaper, ExternalLink, Clock, RefreshCw } from "lucide-react";

interface NewsSectionProps {
  stockCode: string;
  companyName?: string;
}

interface NewsItem {
  id: number;
  newsTitle: string;
  newsContent: string;
  newsUri: string;
  newsDate: string;
  newsImage: string;
  createdAt: string;
}

interface NewsApiResponse {
  status: boolean;
  code: string;
  message: string;
  data: NewsItem[];
}

// 뉴스 데이터 캐싱을 위한 클래스
class NewsDataCache {
  private cache = new Map<string, { data: NewsItem[]; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10분 캐시

  get(stockCode: string): NewsItem[] | null {
    const cached = this.cache.get(stockCode);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  set(stockCode: string, data: NewsItem[]): void {
    this.cache.set(stockCode, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// 중복 요청 방지를 위한 클래스
class NewsRequestManager {
  private pendingRequests = new Map<string, Promise<NewsItem[]>>();

  async executeRequest(
    stockCode: string,
    requestFn: () => Promise<NewsItem[]>
  ): Promise<NewsItem[]> {
    if (this.pendingRequests.has(stockCode)) {
      return this.pendingRequests.get(stockCode)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(stockCode);
    });

    this.pendingRequests.set(stockCode, promise);
    return promise;
  }
}

const newsDataCache = new NewsDataCache();
const newsRequestManager = new NewsRequestManager();

export function NewsSection({ stockCode, companyName }: NewsSectionProps) {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 뉴스 데이터 가져오기
  const fetchNewsData = useCallback(
    async (code: string, forceRefresh = false) => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // 캐시 확인 (강제 새로고침이 아닌 경우)
        if (!forceRefresh) {
          const cachedData = newsDataCache.get(code);
          if (cachedData) {
            setNewsData(cachedData);
            setLoading(false);
            return;
          }
        }

        // 중복 요청 방지
        const data = await newsRequestManager.executeRequest(code, async () => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACK_API_URL}/news/stock/${code}`,
            {
              signal: abortControllerRef.current?.signal,
            }
          );

          if (!response.ok) {
            throw new Error("뉴스 데이터를 가져오는데 실패했습니다.");
          }

          const apiData: NewsApiResponse = await response.json();

          console.log("뉴스 API 응답:", apiData);

          if (
            apiData.status === false ||
            (apiData.code !== "SUCCESS" && apiData.code !== "SUCCESS-001")
          ) {
            throw new Error(
              apiData.message || "뉴스 데이터 조회에 실패했습니다."
            );
          }

          console.log("뉴스 데이터:", apiData.data);
          return apiData.data;
        });

        // 캐시에 저장
        newsDataCache.set(code, data);
        setNewsData(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // 요청이 취소된 경우
        }

        console.error("뉴스 데이터 가져오기 실패:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    try {
      // MySQL datetime 형식 (2024-01-15 00:15:25.000000)을 ISO 형식으로 변환
      const isoDateString = dateString.replace(" ", "T");
      const date = new Date(isoDateString);

      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return "날짜 정보 없음";
      }

      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) {
        return "방금 전";
      } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}일 전`;
      }
    } catch (error) {
      console.error("날짜 파싱 오류:", error);
      return "날짜 정보 없음";
    }
  };

  // stockCode 변경 시 뉴스 데이터 가져오기
  useEffect(() => {
    if (stockCode) {
      fetchNewsData(stockCode);
    }

    // 컴포넌트 언마운트 시 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stockCode, fetchNewsData]);

  // 강제 새로고침 핸들러
  const handleRefresh = () => {
    fetchNewsData(stockCode, true);
  };

  return (
    <Card className="mx-4 mt-4 mb-4 shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between text-gray-900">
          <div className="flex items-center">
            <Newspaper className="h-5 w-5 mr-2" />
            관련 뉴스
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-500">뉴스 로딩 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                다시 시도
              </Button>
            </div>
          </div>
        ) : newsData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">관련 뉴스가 없습니다.</p>
          </div>
        ) : (
          newsData.map((news) => (
            <div
              key={news.id}
              className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                    {news.newsTitle}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    {news.newsContent}
                  </p>
                  {news.newsImage && (
                    <div className="mt-2">
                      <img
                        src={news.newsImage}
                        alt={news.newsTitle}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">뉴스</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(news.newsDate)}</span>
                  </div>
                </div>
                <a
                  href={news.newsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <span>읽기</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        )}

        {newsData.length > 0 && (
          <div className="pt-2 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              더 많은 뉴스 보기
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
