"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Next.js의 Image 컴포넌트 사용
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Folder, ChevronRight, Loader2 } from "lucide-react";
import { ScrapGroup } from "@/src/types/ScrapGroup";
import { ApiResponse } from "@/src/types/ApiResponse";
import { MemberStockResponseDto } from "@/src/types/MemberStock";
import { StockLogo } from "@/src/components/ui/StockLogo";

export default function ScrapPage() {
  const [activeTab, setActiveTab] = useState<"stocks" | "groups">("stocks");
  const router = useRouter();

  const [memberStocks, setMemberStocks] = useState<MemberStockResponseDto[]>(
    []
  );
  const [isStocksLoading, setIsStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);

  const [scrapGroupList, setScrapGroupList] = useState<ScrapGroup[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberStocks = async () => {
      setIsStocksLoading(true);
      setStocksError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/member-stocks`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "보유 주식 목록을 불러오는 데 실패했습니다."
          );
        }
        const result: ApiResponse<MemberStockResponseDto[]> =
          await response.json();
        if (result.data) {
          setMemberStocks(result.data);
        }
      } catch (err: any) {
        setStocksError(err.message);
      } finally {
        setIsStocksLoading(false);
      }
    };

    const fetchScrapGroups = async () => {
      setIsGroupsLoading(true);
      setGroupsError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "스크랩 그룹을 불러오는 데 실패했습니다."
          );
        }

        const result: ApiResponse<ScrapGroup[]> = await response.json();

        if (result.data) {
          setScrapGroupList(result.data);
        }
      } catch (err: any) {
        setGroupsError(err.message);
      } finally {
        setIsGroupsLoading(false);
      }
    };

    fetchMemberStocks();
    fetchScrapGroups();
  }, []);

  // 종목 탭 렌더링 함수
  const renderStocksTab = () => {
    if (isStocksLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-sm">종목 목록을 불러오는 중...</span>
        </div>
      );
    }

    if (stocksError) {
      return (
        <div className="text-center text-red-500 p-8 text-sm">
          오류가 발생했습니다: {stocksError}
        </div>
      );
    }

    return (
      <div className="px-3 py-4 space-y-2">
        {memberStocks.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-md transition-shadow rounded-xl border border-gray-200"
            onClick={() => router.push(`/scrap/stock/${item.stock.stockId}`)}
          >
            {/* (종목코드와 유저번호 알고있는 상태)
            종목 버튼 누르면 카드에서 스크랩을 누른 기사들이 나온다 (scrapgrouped 의 데이터.)
             scrapgrouped 의 member_stock_snapshot_id로 investment_type_news_comment테이블의 내용, investment_type_news_comment의
             summary_id로 summary 를 가져옴. 
             최종적으로 */}
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                {/* 왼쪽: 이미지 + 종목 정보 */}
                <div className="flex items-center gap-3">
                  {/* 기존 Image 태그를 StockLogo 컴포넌트로 교체 */}
                  <StockLogo
                    stockId={item.stock.stockId}
                    stockName={item.stock.stockName}
                  />
                  <div>
                    <h3 className="font-medium text-base">
                      {item.stock.stockName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.stock.stockId}
                    </p>
                  </div>
                </div>
                {/* 오른쪽: 화살표 아이콘 */}
                <div className="flex items-center space-x-1">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderGroupsTab = () => {
    if (isGroupsLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-sm">그룹 목록을 불러오는 중...</span>
        </div>
      );
    }

    if (groupsError) {
      return (
        <div className="text-center text-red-500 p-8 text-sm">
          오류가 발생했습니다: {groupsError}
        </div>
      );
    }

    return (
      <div className="px-3 py-4">
        <div className="flex flex-col gap-3">
          {scrapGroupList.map((group) => (
            <Card
              key={String(group.id)}
              className="cursor-pointer hover:shadow-md transition-shadow rounded-xl border border-gray-200"
              onClick={() => router.push(`/scrap/group/${group.id}`)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Folder className="h-4 w-4 mr-2 text-blue-600" />
                    <h3 className="font-medium text-base">
                      {group.scrapGroupName}
                    </h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 그룹 추가 버튼 */}
          <Button
            onClick={() => router.push("/")} // 추후 그룹 추가 경로로 수정해야 합니다.
            className="w-full h-[42px] bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm shadow-md mt-4 mb-6"
          >
            그룹 추가
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-white relative">
      <TopNavigation />

      <div className="px-4 pt-3 pb-2 border-b bg-white">
        <h1 className="text-lg font-bold flex items-center mb-3"></h1>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <Button
            variant={activeTab === "stocks" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-md"
            onClick={() => setActiveTab("stocks")}
          >
            종목
          </Button>
          <Button
            variant={activeTab === "groups" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-md"
            onClick={() => setActiveTab("groups")}
          >
            그룹
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-24 bg-gray-50">
        {activeTab === "stocks" ? renderStocksTab() : renderGroupsTab()}
      </main>

      <BottomNavigation />
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { TopNavigation } from "@/src/components/top-navigation";
// import { BottomNavigation } from "@/src/components/bottom-navigation";
// import { Card, CardContent } from "@/src/components/ui/card";
// import { Button } from "@/src/components/ui/button";
// import { Folder, ChevronRight, Loader2 } from "lucide-react";
// import { ScrapGroup } from "@/src/types/ScrapGroup";
// import { ApiResponse } from "@/src/types/ApiResponse";

// const StockList = [
//   { id: 1, name: "애플", code: "AAPL", cardCount: 12 },
//   { id: 2, name: "엔비디아", code: "NVDA", cardCount: 8 },
//   { id: 3, name: "테슬라", code: "TSLA", cardCount: 15 },
//   { id: 4, name: "구글", code: "GOOGL", cardCount: 6 },
// ];

// export default function ScrapPage() {
//   const [activeTab, setActiveTab] = useState<"stocks" | "groups">("stocks");
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [scrapGroupList, setScrapGroupList] = useState<ScrapGroup[]>([]);

//   useEffect(() => {
//     const fetchScrapGroups = async () => {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup`,
//           {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//           }
//         );
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(
//             errorData.message || "스크랩 그룹을 불러오는 데 실패했습니다."
//           );
//         }

//         const result: ApiResponse<ScrapGroup[]> = await response.json();

//         if (result.data) {
//           setScrapGroupList(result.data);
//         }
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchScrapGroups();
//   }, []);

//   return (
//     <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-white relative">
//       <TopNavigation />

//       <div className="px-4 pt-3 pb-2 border-b bg-white">
//         <h1 className="text-lg font-bold flex items-center mb-3"></h1>
//         <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
//           <Button
//             variant={activeTab === "stocks" ? "default" : "ghost"}
//             size="sm"
//             className="flex-1 rounded-md"
//             onClick={() => setActiveTab("stocks")}
//           >
//             종목
//           </Button>
//           <Button
//             variant={activeTab === "groups" ? "default" : "ghost"}
//             size="sm"
//             className="flex-1 rounded-md"
//             onClick={() => setActiveTab("groups")}
//           >
//             그룹
//           </Button>
//         </div>
//       </div>

//       <main className="flex-1 overflow-y-auto pb-24 bg-gray-50">
//         {activeTab === "stocks" ? (
//           <div className="px-3 py-4 space-y-2">
//             {StockList.map((stock) => (
//               <Card
//                 key={stock.id}
//                 className="cursor-pointer hover:shadow-md transition-shadow rounded-xl border border-gray-200"
//                 onClick={() => router.push(`/scrap/stock/${stock.code}`)}
//               >
//                 <CardContent className="p-3">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="font-medium text-base">{stock.name}</h3>
//                       <p className="text-xs text-gray-500">{stock.code}</p>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <span className="text-xs text-gray-500">
//                         {stock.cardCount}개
//                       </span>
//                       <ChevronRight className="h-4 w-4 text-gray-400" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <div className="px-3 py-4">
//             {isLoading ? (
//               <div className="flex justify-center items-center p-8">
//                 <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
//                 <span className="ml-2 text-sm">그룹 목록을 불러오는 중...</span>
//               </div>
//             ) : error ? (
//               <div className="text-center text-red-500 p-8 text-sm">
//                 오류가 발생했습니다: {error}
//               </div>
//             ) : (
//               <div className="flex flex-col gap-3">
//                 {scrapGroupList.map((group) => (
//                   <Card
//                     key={String(group.id)}
//                     className="cursor-pointer hover:shadow-md transition-shadow rounded-xl border border-gray-200"
//                     onClick={() => router.push(`/scrap/group/${group.id}`)}
//                   >
//                     <CardContent className="p-3">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <Folder className="h-4 w-4 mr-2 text-blue-600" />
//                           <h3 className="font-medium text-base">
//                             {group.scrapGroupName}
//                           </h3>
//                         </div>
//                         <ChevronRight className="h-4 w-4 text-gray-400" />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}

//                 {/* 그룹 추가 버튼을 리스트 바로 아래에 위치 */}
//                 <Button
//                   onClick={() => router.push("/")} // 추후 그룹 추가 경로로 수정
//                   className="w-full h-[42px] bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm shadow-md mt-4 mb-6"
//                 >
//                   그룹 추가
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </main>
//       <BottomNavigation />
//     </div>
//   );
// }
