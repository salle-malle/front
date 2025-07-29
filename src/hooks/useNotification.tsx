import { useEffect } from "react";
import { toast } from "@/src/hooks/use-toast"; // 이미 작성된 커스텀 toast 사용

export default function useNotification(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACK_API_URL}/notifications/stream`,
      {
        withCredentials: true,
      }
    );

    eventSource.onmessage = function (event) {
      console.log("받은 데이터:", event.data);

      // 커스텀 toast 호출
      toast({
        title: "🔔 새로운 알림",
        description: event.data,
        action: (
          <div
            onClick={() => (window.location.href = "/notifications")}
            style={{
              position: "absolute",
              inset: 0,
              cursor: "pointer",
              zIndex: 10,
            }}
          />
        ),
      });
    };

    eventSource.onerror = function (err) {
      console.error("[SSE 에러 발생] 자동 재연결 시도..", err);
    };

    return () => {
      console.log("SSE 연결 해제");
      eventSource.close();
    };
  }, [enabled]);
}
