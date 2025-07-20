export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface EarningCall {
  id: number;
  stockId: string;
  stockName: string;
  earningCallDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EarningCallResponse {
  status: boolean;
  code: string;
  message: string;
  data: EarningCall[];
}
