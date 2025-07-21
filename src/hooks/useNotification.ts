import { useEffect } from "react";
import { toast } from "@/src/hooks/use-toast"; // 이미 작성된 커스텀 toast 사용

export default function useNotification(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    // if (!memberId || memberId <= 0) return;

    // const eventSource = new EventSource(
    //   `http://localhost:8080/api/v1/notifications/stream?memberId=${memberId}`
    // );

    const eventSource = new EventSource(
      "http://localhost:8080/api/v1/notifications/stream",
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
