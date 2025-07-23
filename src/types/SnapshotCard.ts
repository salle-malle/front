export interface SnapshotCard {
  snapshotId: number;
  snapshotCreatedAt: string;
  personalizedComment: string;
  stockCode: string;
  stockName: string;
  newsContent: string;
  newsImage: string;
}

export interface UnifiedStockItem {
  stock_type: string;
  prdt_name: string; // 상품명 (종목명)
  pdno: string; // 상품번호 (종목코드)
  evaluation_amount: string; // 평가금액
  profit_loss_amount: string; // 손익금액
  profit_loss_rate: string; // 손익률
}
