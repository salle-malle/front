// 백엔드 Spring DTO의 Stock 모델과 필드명을 일치시킵니다.
// (JSON으로 변환될 때 camelCase로 변경된 필드명 기준)
export interface Stock {
  stockId: string;
  stockName: string;
  stockImageUri: string;
  stockIsDelisted: boolean;
  createdAt: string;
  updatedAt: string;
  // 필요에 따라 다른 stock 필드를 추가할 수 있습니다.
}

// /member-stocks API의 응답 데이터 타입
export interface MemberStockResponseDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  memberId: number;
  stock: Stock;
}

export interface MemberStockSnapshotDetailResponseDto {
  snapshotId: number;
  snapshotCreatedAt: string;
  personalizedComment: string;
  stockCode: string;
  stockName: string;
  newsContent: string;
  newsImage: string;
  isScrap: boolean;
}
