import { Suspense } from "react";
import { RecruitmentView } from "@/components/recruitment/RecruitmentView";

export default function RecruitmentPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-xl" />}>
      <RecruitmentView />
    </Suspense>
  );
}
