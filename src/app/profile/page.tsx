import type { Metadata } from "next";
import { userProfile } from "@/data/profile";
import { UserProfilePage } from "@/features/marketplace/user-profile-page";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return <UserProfilePage profile={userProfile} />;
}
