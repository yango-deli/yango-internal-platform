import { redirect } from "next/navigation";

export default function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/recruitment?candidate=${params.id}`);
}
