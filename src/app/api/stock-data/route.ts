import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StockApp/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Alpha Vantage API 에러 체크
    if (data["Error Message"]) {
      return NextResponse.json(
        { error: data["Error Message"] },
        { status: 400 }
      );
    }

    if (data["Note"]) {
      return NextResponse.json(
        { error: "API 호출 한도 초과. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Alpha Vantage API 호출 실패:", error);
    return NextResponse.json(
      { error: "주식 데이터를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
