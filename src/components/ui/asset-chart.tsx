import { Card, CardContent } from "@/src/components/ui/card";
import dynamic from "next/dynamic";
import ChartPeriodSelector from "@/src/components/ui/chart-period";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface AssetTrendData {
  series: { name: string; data: number[] }[];
  options: any;
}

interface AssetChartProps {
  assetTrendData: AssetTrendData;
}

export default function AssetChart({ assetTrendData }: AssetChartProps) {
  return (
    <Card
      className="mb-2 rounded-xl border-none w-full"
      style={{
        maxWidth: "700px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <CardContent className="rounded-xl p-0">
        <div
          className="flex items-center justify-center w-full"
          style={{
            height: "180px",
            minHeight: "120px",
            maxHeight: "220px",
            padding: 0,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            style={{
              height: "180px",
              minHeight: "120px",
              maxHeight: "220px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              paddingTop: "8px",
              paddingBottom: "0px",
              overflow: "hidden",
            }}
          >
            <ApexChart
              type="area"
              width="100%"
              height="100%"
              series={assetTrendData.series}
              options={{
                ...assetTrendData.options,
                chart: {
                  ...assetTrendData.options?.chart,
                  type: "area",
                  toolbar: { show: false },
                  zoom: { enabled: false },
                  height: "100%",
                  width: "100%",
                  parentHeightOffset: 0,
                },
                stroke: {
                  width: 3,
                  curve: "smooth",
                  // colors는 assetTrendData.options에서 이미 정의되어 있다고 가정
                  ...(assetTrendData.options?.stroke || {}),
                },
                fill: {
                  type: "gradient",
                  ...(assetTrendData.options?.fill || {}),
                },
                colors: assetTrendData.options?.colors,
                dataLabels: { enabled: false },
                grid: {
                  show: false,
                  padding: { left: 0, right: 0, top: 0, bottom: 0 },
                },
                xaxis: {
                  ...assetTrendData.options?.xaxis,
                  labels: { show: false },
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  floating: false,
                  tooltip: { enabled: false },
                  min: undefined,
                  max: undefined,
                  range: undefined,
                },
                yaxis: {
                  show: false,
                  min: undefined,
                  max: undefined,
                },
                tooltip: { enabled: true },
                markers: { size: 0 },
                legend: { show: false },
              }}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "100px",
                maxHeight: "200px",
                display: "block",
              }}
            />
          </div>
        </div>
      </CardContent>
      <ChartPeriodSelector />
    </Card>
  );
}