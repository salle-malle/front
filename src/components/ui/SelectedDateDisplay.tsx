"use client";

interface SelectedDateDisplayProps {
  date: string; // YYYY-MM-DD 형식
}

export const SelectedDateDisplay = ({ date }: SelectedDateDisplayProps) => {
  // 빈 문자열이나 잘못된 날짜 형식 처리
  if (!date || date === "") {
    return (
      <div className="bg-white p-3 border-b text-sm">
        <div className="flex items-center justify-between">
          <span className="font-bold">날짜를 선택해주세요</span>
        </div>
      </div>
    );
  }

  // 시간대 문제를 피하기 위해 'T00:00:00'을 추가합니다.
  const dateObj = new Date(date + "T00:00:00");
  
  // 잘못된 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return (
      <div className="bg-white p-3 border-b text-sm">
        <div className="flex items-center justify-between">
          <span className="font-bold">날짜 형식 오류</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 border-b text-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold">
          {dateObj.getFullYear()}{" "}
          {dateObj.toLocaleString("en-US", { month: "long" })}{" "}
          {dateObj.getDate()}
        </span>
        <span className="text-gray-500">
          {dateObj.toLocaleString("en-US", { weekday: "long" })}
        </span>
      </div>
    </div>
  );
};
