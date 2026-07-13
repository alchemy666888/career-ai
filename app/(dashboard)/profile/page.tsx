import { CareerProfilePage } from "@/components/career/profile/CareerProfilePage";
import { requireActiveUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db";
import { getProfileView } from "@/lib/domain/profile/service";

export default async function ProfilePage() {
  if (!process.env.DATABASE_URL) {
    return <CareerProfilePage profile={{ id: "00000000-0000-0000-0000-000000000000", workStyle: "unknown", targetRoles: [], preferredLocations: [], skills: [], experience: [], education: [], nextRecommendedAction: "Configure DATABASE_URL to save your profile." }} completeness={{ score: 0, nextRecommendedAction: "Configure DATABASE_URL to save your profile." }} />;
  }
  const user = await requireActiveUser();
  const view = await getProfileView(getDb(), user.id);
  return <CareerProfilePage profile={view.profile} completeness={view.completeness} evidence={view.evidence} resumes={view.resumes} />;
}
