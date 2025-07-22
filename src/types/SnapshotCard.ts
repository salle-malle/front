export interface SnapshotCard {
  snapshotId: number;
  snapshotCreatedAt: string; // ISO 문자열 형태
  personalizedComment: string;
  stockCode: string;
  stockName: string;
  newsContent: string;
}
