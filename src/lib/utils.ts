import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * stockId를 기반으로 주식 로고 이미지 URL을 생성합니다.
 * @param stockId - 종목 코드 (예: 'AAPL', '005930')
 * @returns 해당 종목의 로고 이미지 URL
 */
export const getStockLogoUrl = (stockId: string): string => {
  // 정규식을 사용해 stockId가 숫자로만 이루어져 있는지 확인 (한국 주식 판별)
  const isKoreanStock = /^\d+$/.test(stockId);

  if (isKoreanStock) {
    // 한국 주식: 네이버 금융 로고 URL 사용 (안정적)
    return `https://ssl.pstatic.net/imgfinance/chart/item/logo/${stockId}.png`;
  } else {
    // 미국 주식: Financial Modeling Prep의 무료 로고 URL 사용
    // 참고: 이 URL은 API 키 없이 사용 가능하지만, 프로덕션 환경에서는 API 키를 발급받아 사용하는 것이 안정적입니다.
    return `https://financialmodelingprep.com/image-stock/${stockId}.png`;
  }
};
