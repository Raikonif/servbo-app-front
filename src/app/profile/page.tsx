import type { Metadata } from "next";
import { RequireSession } from "@/features/auth/require-session";
import { ProfileView } from "@/features/marketplace/profile-view";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <RequireSession>
      <ProfileView />
    </RequireSession>
  );
}
