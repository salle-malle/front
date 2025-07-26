"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  BarChart3,
  DollarSign,
  Activity,
  TrendingUp,
  Percent,
  Target,
} from "lucide-react";
import type { OverseasStockDetail } from "@/src/types/ApiResponse";
import { MdDataExploration } from "react-icons/md";
import { MdOutlineDataExploration } from "react-icons/md";

interface KeyStatsProps {
  stockData: OverseasStockDetail;
}

export function KeyStats({ stockData }: KeyStatsProps) {
  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const formatNumber = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
  };

  const formatLargeNumber = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "0";

    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatRatio = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "-";
    return num.toFixed(2);
  };

  const formatPercent = (value: string) => {
    const num = Number.parseFloat(value);
    if (isNaN(num)) return "0.00%";
    return `${num.toFixed(2)}%`;
  };

  // 주요 지표
  const keyMetrics = [
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "시가총액",
      value: formatLargeNumber(stockData.tomv),
      subtitle: "Market Cap",
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "자본금",
      value: formatLargeNumber(stockData.mcap),
      subtitle: "Capital",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-red-500" />,
      title: "52주 최고",
      value: formatCurrency(stockData.h52p),
      subtitle: "52W High",
      valueColor: "text-red-500",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-blue-500 rotate-180" />,
      title: "52주 최저",
      value: formatCurrency(stockData.l52p),
      subtitle: "52W Low",
      valueColor: "text-blue-500",
    },
  ];

  // 투자 비율
  const investmentRatios = [
    {
      label: "P/E Ratio",
      value: formatRatio(stockData.perx),
      description: "주가수익비율",
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: "EPS",
      value: formatCurrency(stockData.epsx),
      description: "주당순이익",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "BPS",
      value: formatCurrency(stockData.bpsx),
      description: "주당순자산",
      icon: <Percent className="h-4 w-4" />,
    },
    {
      label: "PBR",
      value: formatRatio(stockData.pbrx),
      description: "주가순자산비율",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  // 52주 범위
  const weekRange = {
    high: formatCurrency(stockData.h52p),
    low: formatCurrency(stockData.l52p),
    current: formatCurrency(stockData.base || stockData.txprc),
  };

  return (
    <div className="mx-4 mt-4 space-y-4">
      {/* 주요 지표 */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <BarChart3 className="h-5 w-5 mr-2" />
            주요 지표
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg">{metric.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {metric.title}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      metric.valueColor || "text-gray-900"
                    }`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500">{metric.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 투자 비율 */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            {/* <MdOutlineDataExploration className="h-5 w-5 mr-2" /> */}
            투자 비율
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {investmentRatios.map((ratio, index) => (
              <div
                key={index}
                className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2 text-gray-600">
                  {ratio.icon}
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  {ratio.description}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {ratio.label}
                </p>
                <p className="text-xl font-bold text-gray-900">{ratio.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
