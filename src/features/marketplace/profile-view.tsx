"use client";

import { userProfile } from "@/data/profile";
import { displayName, useSession } from "@/hooks/use-session";
import { UserProfilePage } from "./user-profile-page";

const joinedFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

// Identity comes from the signed-in account; the rest of the profile
// (activity, saved products...) is still sample data until the API has it.
export function ProfileView() {
  const user = useSession().data?.user;
  if (!user) return null;

  return (
    <UserProfilePage
      profile={{
        ...userProfile,
        name: displayName(user),
        username: user.username ? `@${user.username}` : user.email,
        email: user.email,
        role: user.is_seller ? "Seller" : "Buyer",
        verified: user.is_email_verified,
        joinedAt: joinedFormatter.format(new Date(user.created_at)),
      }}
    />
  );
}
