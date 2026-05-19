export type SwipeAction = "like" | "dislike" | "superlike" | "rose" | "compliment";

export interface DiscoverProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  images?: string[];
  university: string;
  department?: string;
  gender?: string;
  ethnicity?: string;
  careerAmbition?: string;
  education?: string;
  religion?: string;
  politics?: string;
  smoking?: string;
  drinking?: string;
  lifestyle?: string;
  interests?: string[];
  hobbies?: string[];
  prompts?: Array<{ question: string; answer: string }>;
  relationshipGoals?: string;
  height?: string;
  distance?: string;
  verified?: boolean;
  mutualCount?: number;
  online?: boolean;
  matchProbability?: number;
  compatibilityScore?: string;
}

export interface SwipeEvent {
  profileId: string;
  action: SwipeAction;
  timestamp: number;
  profile: DiscoverProfile;
}
