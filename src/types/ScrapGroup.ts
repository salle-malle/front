export interface ScrapGroup {
  id: number;
  scrapGroupName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapGroupList {
  ScrapGroupList: ScrapGroup[];
}

export interface ScrapGroupedResponseDto {
  id: number;
  scrapId: number;
  scrapGroupId: number;
  scrapGroupName: string;
  memberStockSnapshotId: number;
  stockName: string;
  createdAt: string;
}

export interface ScrapGroupResponseDto {
  id: number;
  scrapGroupName: string;
  createdAt: string;
  updatedAt: string;
}
