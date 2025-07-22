"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

interface NewsSectionProps {
  stockCode: string;
  companyName?: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: "positive" | "negative" | "neutral";
}

export function NewsSection({ stockCode, companyName }: NewsSectionProps) {
  // 실제 구현시에는 뉴스 API에서 데이터를 가져와야 함
  const sampleNews: NewsItem[] = [
    {
      id: "1",
      title: `${companyName || stockCode} 3분기 실적 발표, 예상치 상회`,
      summary:
        "매출과 순이익 모두 시장 예상치를 웃돌며 강력한 실적을 기록했습니다.",
      source: "Reuters",
      publishedAt: "2시간 전",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "2",
      title: "새로운 제품 라인업 발표로 주가 상승 전망",
      summary:
        "혁신적인 기술이 적용된 신제품 발표로 투자자들의 관심이 집중되고 있습니다.",
      source: "Bloomberg",
      publishedAt: "5시간 전",
      url: "#",
      sentiment: "positive",
    },
    {
      id: "3",
      title: "글로벌 공급망 이슈로 인한 영향 분석",
      summary:
        "공급망 차질이 단기적으로 생산에 영향을 미칠 수 있다는 분석이 나왔습니다.",
      source: "Financial Times",
      publishedAt: "1일 전",
      url: "#",
      sentiment: "neutral",
    },
    {
      id: "4",
      title: "애널리스트들의 목표주가 상향 조정",
      summary:
        "주요 투자은행들이 강력한 펀더멘털을 근거로 목표주가를 상향 조정했습니다.",
      source: "MarketWatch",
      publishedAt: "2일 전",
      url: "#",
      sentiment: "positive",
    },
  ];

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 text-xs"
          >
            긍정적
          </Badge>
        );
      case "negative":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 text-xs"
          >
            부정적
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 text-xs"
          >
            중립
          </Badge>
        );
    }
  };

  return (
    <Card className="mx-4 mt-4 mb-4 shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-gray-900">
          <Newspaper className="h-5 w-5 mr-2" />
          관련 뉴스
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sampleNews.map((news) => (
          <div
            key={news.id}
            className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 pr-2">
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                  {news.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  {news.summary}
                </p>
              </div>
              {getSentimentBadge(news.sentiment)}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <span className="font-medium">{news.source}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{news.publishedAt}</span>
                </div>
              </div>
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                <span>읽기</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        <div className="pt-2 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            더 많은 뉴스 보기
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
