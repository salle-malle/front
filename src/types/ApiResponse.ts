export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface EarningCall {
  id: number;
  stockId: string;
  stockName: string;
  ovrsItemName: string;
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

export interface OverseasStockDetail {
  txprc: string; // 현재가
  txdif: string; // 등락폭
  txrat: string; // 등락률
  trate: string; // 거래량
  txsgn: string; // 전일대비구분
  pxprc: string; // 전일종가
  pxdif: string; // 전일등락폭
  pxrat: string; // 전일등락률
  prate: string; // 전일거래량
  pxsng: string; // 전일대비구분
  eordyn: string; // 매매가능여부
  ehogau: string; // 호가단위
  eicod: string; // 업종코드
  eparp: string; // 파생상품구분
  rsym: string; // 종목코드
  zdiv: string; // 구분
  curr: string; // 통화
  vnit: string; // 단위
  open: string; // 시가
  high: string; // 고가
  low: string; // 저가
  last: string; // 최종가
  base: string; // 기준가
  pvol: string; // 거래량
  pamt: string; // 거래대금
  uplp: string; // 상한가
  dnlp: string; // 하한가
  h52p: string; // 52주최고가
  h52d: string; // 52주최고일
  l52p: string; // 52주최저가
  l52d: string; // 52주최저일
  perx: string; // PER
  pbrx: string; // PBR
  epsx: string; // EPS
  bpsx: string; // BPS
  shar: string; // 상장주식수
  mcap: string; // 시가총액
  tomv: string; // 거래대금
  t_xprc: string; // 현재가(원화)
  t_xdif: string; // 등락폭(원화)
  t_xrat: string; // 등락률(원화)
  p_xprc: string; // 전일종가(원화)
  p_xdif: string; // 전일등락폭(원화)
  p_xrat: string; // 전일등락률(원화)
  t_rate: string; // 거래량(원화)
  p_rate: string; // 전일거래량(원화)
  t_xsgn: string; // 전일대비구분(원화)
  p_xsng: string; // 전일대비구분(원화)
  e_ordyn: string; // 매매가능여부(원화)
  e_hogau: string; // 호가단위(원화)
  e_icod: string; // 업종코드(원화)
  e_parp: string; // 파생상품구분(원화)
  tvol: string; // 거래량
  tamt: string; // 거래대금
  etyp_nm: string; // 종목명
}

export interface OverseasStockDetailResponse {
  status: boolean;
  code: string;
  message: string;
  data: {
    output: OverseasStockDetail;
    rt_cd: string;
    msg_cd: string;
    msg1: string;
  };
}
