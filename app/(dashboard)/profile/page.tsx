import { CareerProfilePage } from "@/components/career/profile/CareerProfilePage";
import { fixtureProfile } from "@/components/career/journey/fixtures";

const mockProfile = {
  id: "00000000-0000-0000-0000-000000000000",
  name: fixtureProfile.name,
  headline: fixtureProfile.headline,
  summary: fixtureProfile.history.join("\n"),
  location: fixtureProfile.preferences[0] ?? null,
  workStyle: "unknown",
  targetRoles: fixtureProfile.targetRoles,
  preferredLocations: fixtureProfile.preferences,
  skills: fixtureProfile.skills,
  experience: fixtureProfile.history,
  education: [],
  nextRecommendedAction: fixtureProfile.nextField
};

const mockEvidence = fixtureProfile.evidence.map((item) => ({
  id: item.id,
  title: item.title,
  content: item.summary,
  sourceType: "demo_fixture",
  claimState: "user_approved"
}));

export default async function ProfilePage() {
  return <CareerProfilePage profile={mockProfile} completeness={{ score: fixtureProfile.completeness, nextRecommendedAction: fixtureProfile.nextField }} evidence={mockEvidence} resumes={[]} />;
}
