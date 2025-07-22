import { Suspense } from "react";
import CalendarClient from "./CalendarClient";

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarClient />
    </Suspense>
  );
}
