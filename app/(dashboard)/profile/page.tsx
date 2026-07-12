import { getServerSession } from "next-auth";
import { CareerProfilePage } from "@/components/career/profile/CareerProfilePage";
import { authOptions } from "@/lib/auth/auth";
import { requireActiveUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db";
import { getProfileView } from "@/lib/domain/profile/service";

const guestProfile = {
  id: "00000000-0000-0000-0000-000000000000",
  workStyle: "unknown",
  targetRoles: [],
  preferredLocations: [],
  skills: [],
  experience: [],
  education: [],
  nextRecommendedAction: "Sign-in is currently disabled, so profile changes run in demo mode."
};

const guestCompleteness = {
  score: 0,
  nextRecommendedAction: "Add profile details locally while account sign-in is disabled."
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!process.env.DATABASE_URL || !session?.user?.id) {
    return <CareerProfilePage profile={guestProfile} completeness={guestCompleteness} />;
  }

  const user = await requireActiveUser();
  const view = await getProfileView(getDb(), user.id);
  return <CareerProfilePage profile={view.profile} completeness={view.completeness} />;
}
