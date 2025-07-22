export default function AssetSummary({assetAmount}: {assetAmount: number}) {
    return (
      <div
        className="flex items-center justify-center min-h-[60px] py-1"
        style={{
          height: 65,
          marginTop: "-8px",
          marginBottom: "2px",
        }}
      >
        <div
          className="w-full bg-white rounded-xl px-4 py-0 flex flex-col justify-center mx-auto"
          style={{
            height: 55,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div className="flex items-center justify-start w-full h-full" style={{ height: "100%" }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 25,
                height: 24,
                borderRadius: "30%",
                background: "#F0F6FE",
                marginRight: 10,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <text x="11" y="16" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3182f6" fontFamily="arial">$</text>
              </svg>
            </div>
            <div className="flex flex-col justify-center h-full" style={{ height: "100%" }}>
              <span className="text-m font-semibold" style={{ lineHeight: "1" }}>${assetAmount.toLocaleString()}</span>
              <span className="text-[11px] text-gray-400" style={{ lineHeight: "1", marginTop: "2px" }}>투자 자산 총액</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  