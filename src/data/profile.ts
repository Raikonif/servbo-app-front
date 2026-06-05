export type ProfileStat = {
  label: string;
  value: string;
  helper: string;
};

export type ProfileActivity = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

export type ProfileSavedProduct = {
  id: string;
  title: string;
  seller: string;
  price: string;
  status: string;
};

export type UserProfile = {
  name: string;
  username: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  joinedAt: string;
  responseGoal: string;
  verified: boolean;
  bio: string;
  plan: {
    name: string;
    status: string;
    renewal: string;
  };
  stats: ProfileStat[];
  activity: ProfileActivity[];
  savedProducts: ProfileSavedProduct[];
};

export const userProfile: UserProfile = {
  name: "Alex Morgan",
  username: "@alex.servbo",
  role: "Store operator",
  email: "alex.morgan@example.com",
  phone: "+1 (512) 555-0148",
  location: "Austin, TX",
  joinedAt: "March 2024",
  responseGoal: "Under 2 hours",
  verified: true,
  bio: "Runs daily catalog operations, reviews seller quality, and coordinates buyer follow-up for the Servbo marketplace.",
  plan: {
    name: "Growth",
    status: "active",
    renewal: "Jul 1, 2026",
  },
  stats: [
    {
      label: "Saved listings",
      value: "18",
      helper: "Across four categories",
    },
    {
      label: "Open chats",
      value: "7",
      helper: "Three need follow-up",
    },
    {
      label: "Orders watched",
      value: "12",
      helper: "Updated this week",
    },
  ],
  activity: [
    {
      id: "activity-watch-desk",
      title: "Saved Oak Studio Desk",
      description: "Added to the furniture shortlist for a local buyer.",
      timestamp: "Today, 9:24 AM",
    },
    {
      id: "activity-message-camera",
      title: "Messaged Frame & Focus",
      description: "Asked for updated lens photos and shipping insurance.",
      timestamp: "Yesterday, 4:18 PM",
    },
    {
      id: "activity-plan",
      title: "Billing plan reviewed",
      description: "Confirmed the Growth plan renewal for marketplace tools.",
      timestamp: "May 30, 2026",
    },
  ],
  savedProducts: [
    {
      id: "studio-desk",
      title: "Oak Studio Desk",
      seller: "Northline Workshop",
      price: "$420",
      status: "Ready to contact",
    },
    {
      id: "mirrorless-kit",
      title: "Mirrorless Camera Kit",
      seller: "Frame & Focus",
      price: "$1,180",
      status: "Photos requested",
    },
    {
      id: "watch-set",
      title: "Automatic Watch Set",
      seller: "Crown Market",
      price: "$360",
      status: "Price watched",
    },
  ],
};
