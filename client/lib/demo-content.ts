export type DemoPrompt = {
  question: string;
  answer: string;
};

export type DemoStudentSeed = {
  id: string;
  name: string;
  age: number;
  university: string;
  department: string;
  gender: string;
  ethnicity: string;
  careerAmbition: string;
  education: string;
  religion: string;
  politics: string;
  smoking: string;
  drinking: string;
  lifestyle: string;
  bio: string;
  relationshipGoals: string;
  height: string;
  hobbies: string[];
  interests: string[];
  prompts: DemoPrompt[];
  images: string[];
  verified: boolean;
  online: boolean;
  distance: string;
  mutualCount: number;
  matchProbability: number;
  compatibilityScore: string;
};

export type DemoCoachSeed = {
  _id: string;
  name: string;
  title: string;
  bio: string;
  specialization: string[];
  consultationTypes: Array<"chat" | "video" | "call">;
  pricePerSession: number;
  rating: number;
  reviewsCount: number;
  sessionsCompleted: number;
  avatar: string;
  badges: string[];
  photos: string[];
  age: number;
  occupation: string;
  yearsExperience: number;
  languages: string[];
  successStories: string[];
  testimonials: Array<{ name: string; text: string; rating: number }>;
  sessionDuration: number;
};

const normalize = (value?: string) => (value || "").trim().toLowerCase().replace(/\s+/g, " ");

export const uniqueStrings = (values: Array<string | undefined | null>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value && String(value).trim()))));

export const DEMO_STUDENT_SEEDS: DemoStudentSeed[] = [
  {
    id: "demo-priya-sharma",
    name: "Priya Sharma",
    age: 21,
    university: "LPU",
    department: "Computer Science",
    gender: "women",
    ethnicity: "South Asian",
    careerAmbition: "Technology",
    education: "Undergraduate",
    religion: "Hindu",
    politics: "Moderate",
    smoking: "never",
    drinking: "socially",
    lifestyle: "Night Owl",
    bio: "Final-year CS student who loves sharp banter, campus coffee walks, and late-night playlist swaps after lab submissions.",
    relationshipGoals: "Serious relationship",
    height: "5'5\"",
    hobbies: ["Chess club", "Cafe hopping", "Sunset reels", "Sketch journaling"],
    interests: ["Coding", "Chess", "Coffee", "Indie music", "Stargazing", "Startup talks"],
    prompts: [
      { question: "My perfect campus date", answer: "Cold coffee, a long walk near the amphitheatre, then stealing fries from your plate." },
      { question: "The way to win me over", answer: "Be consistent, witty, and know your way around a good Spotify queue." },
      { question: "A random fact about me", answer: "I can solve a Rubik's cube faster than I can reply to dry texts." }
    ],
    images: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&auto=format&fit=crop"
    ],
    verified: true,
    online: true,
    distance: "200m away",
    mutualCount: 4,
    matchProbability: 92,
    compatibilityScore: "9.1/10"
  },
  {
    id: "demo-kavya-reddy",
    name: "Kavya Reddy",
    age: 21,
    university: "LPU",
    department: "Fine Arts",
    gender: "women",
    ethnicity: "South Asian",
    careerAmbition: "Arts & Design",
    education: "Undergraduate",
    religion: "Hindu",
    politics: "Progressive",
    smoking: "never",
    drinking: "socially",
    lifestyle: "Adventurous",
    bio: "Fine arts major, part-time barista, and the kind of person who plans dates around exhibitions, bookstores, and matcha stops.",
    relationshipGoals: "Friends first",
    height: "5'4\"",
    hobbies: ["Pottery", "Gallery walks", "Film photography", "Thrifting"],
    interests: ["Art", "Matcha", "Museums", "Books", "Road trips", "Design"],
    prompts: [
      { question: "Together we could", answer: "Turn a random Sunday into a soft-launch worthy day out." },
      { question: "My most irrational fear", answer: "Someone who says they have no favorite song." },
      { question: "Green flag I notice instantly", answer: "When you are kind to service staff without making it performative." }
    ],
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521235835563-5b8671b73d2b?w=900&auto=format&fit=crop"
    ],
    verified: false,
    online: true,
    distance: "500m away",
    mutualCount: 2,
    matchProbability: 84,
    compatibilityScore: "8.4/10"
  },
  {
    id: "demo-simran-kaur",
    name: "Simran Kaur",
    age: 20,
    university: "LPU",
    department: "Psychology",
    gender: "women",
    ethnicity: "South Asian",
    careerAmbition: "Education",
    education: "Undergraduate",
    religion: "Sikh",
    politics: "Progressive",
    smoking: "never",
    drinking: "never",
    lifestyle: "Bookworm",
    bio: "Psychology student with a soft spot for poetry nights, yoga mornings, and conversations that actually go somewhere.",
    relationshipGoals: "Still figuring it out",
    height: "5'6\"",
    hobbies: ["Poetry open mics", "Yoga", "Journaling", "True crime podcasts"],
    interests: ["Psychology", "Poetry", "Yoga", "True crime", "K-dramas", "Wellness"],
    prompts: [
      { question: "I fall for", answer: "Emotional intelligence, eye contact, and people who ask real follow-up questions." },
      { question: "An ideal first message", answer: "Something specific from my profile, not a copy-paste hello." },
      { question: "My weekend usually looks like", answer: "A yoga class, one long voice note, and a comfort rewatch." }
    ],
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505033575518-a36ea2ef75ae?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533636721434-0e2d61030955?w=900&auto=format&fit=crop"
    ],
    verified: true,
    online: true,
    distance: "1.2 km away",
    mutualCount: 6,
    matchProbability: 88,
    compatibilityScore: "8.8/10"
  },
  {
    id: "demo-aditya-patel",
    name: "Aditya Patel",
    age: 22,
    university: "LPU",
    department: "Business Administration",
    gender: "men",
    ethnicity: "South Asian",
    careerAmbition: "Business",
    education: "Undergraduate",
    religion: "Hindu",
    politics: "Apolitical",
    smoking: "never",
    drinking: "socially",
    lifestyle: "Social Butterfly",
    bio: "Business student building two side projects, one very overthought playlist, and hopefully one solid relationship this semester.",
    relationshipGoals: "Serious relationship",
    height: "5'11\"",
    hobbies: ["Pitch decks", "Football", "Cafe work sessions", "Podcasts"],
    interests: ["Business", "Football", "Podcasts", "Travel", "Street food", "Startups"],
    prompts: [
      { question: "I am weirdly competitive about", answer: "Mini golf, fantasy football, and who finds the better cafe first." },
      { question: "My simple pleasure", answer: "A night drive after finishing a stressful week." },
      { question: "The quickest way to my heart", answer: "Match my effort and have opinions about food." }
    ],
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520409364224-63400afe26e5?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop"
    ],
    verified: true,
    online: false,
    distance: "0.8 km away",
    mutualCount: 3,
    matchProbability: 81,
    compatibilityScore: "8.1/10"
  },
  {
    id: "demo-siddharth-nair",
    name: "Siddharth Nair",
    age: 23,
    university: "LPU",
    department: "Mechanical Engineering",
    gender: "men",
    ethnicity: "South Asian",
    careerAmbition: "Engineering",
    education: "Undergraduate",
    religion: "Hindu",
    politics: "Moderate",
    smoking: "socially",
    drinking: "socially",
    lifestyle: "Active & Sporty",
    bio: "Mechanical engineer, amateur guitarist, and a big believer that chemistry should feel easy after the first awkward minute.",
    relationshipGoals: "Casual dating",
    height: "6'0\"",
    hobbies: ["Guitar sessions", "Weekend rides", "Football", "Late-night tea"],
    interests: ["Music", "Bikes", "Football", "Photography", "Tea", "Live gigs"],
    prompts: [
      { question: "We will get along if", answer: "You can laugh at yourself and stay curious about people." },
      { question: "My best spontaneous decision", answer: "Taking a midnight ride for chai during finals week." },
      { question: "Dating me is like", answer: "A playlist that starts mellow and gets surprisingly fun." }
    ],
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=900&auto=format&fit=crop"
    ],
    verified: true,
    online: false,
    distance: "Nearby campus",
    mutualCount: 5,
    matchProbability: 79,
    compatibilityScore: "7.9/10"
  },
  {
    id: "demo-neha-joshi",
    name: "Neha Joshi",
    age: 22,
    university: "LPU",
    department: "Media Studies",
    gender: "women",
    ethnicity: "South Asian",
    careerAmbition: "Arts & Design",
    education: "Undergraduate",
    religion: "Hindu",
    politics: "Progressive",
    smoking: "never",
    drinking: "socially",
    lifestyle: "Social Butterfly",
    bio: "Media student who lives for concert nights, clean aesthetics, and partners who can hold a playful conversation without forcing it.",
    relationshipGoals: "Friends first",
    height: "5'7\"",
    hobbies: ["Concerts", "Photo dumps", "Content shoots", "Travel planning"],
    interests: ["Photography", "Travel", "Music", "Fashion", "Cinema", "Cafe hopping"],
    prompts: [
      { question: "My biggest green flag", answer: "You know how to make plans and actually keep them." },
      { question: "I want someone who", answer: "Can flirt, communicate, and not disappear for three days." },
      { question: "My comfort ritual", answer: "A long shower, oversized hoodie, and one comfort playlist on repeat." }
    ],
    images: [
      "https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502323703110-f2253f546c5e?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=900&auto=format&fit=crop"
    ],
    verified: true,
    online: true,
    distance: "Library block",
    mutualCount: 4,
    matchProbability: 86,
    compatibilityScore: "8.6/10"
  }
];

export const DEMO_COACH_SEEDS: DemoCoachSeed[] = [
  {
    _id: "coach-aanya-kapoor",
    name: "Aanya Kapoor",
    title: "First Date Expert",
    bio: "Helps students move from awkward texting to confident first dates with practical campus-first strategies and post-date feedback.",
    specialization: ["First dates", "Texting confidence", "Ice breakers"],
    consultationTypes: ["chat", "video"],
    pricePerSession: 1499,
    rating: 4.9,
    reviewsCount: 187,
    sessionsCompleted: 620,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop",
    badges: ["Top rated", "Campus favorite"],
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop"
    ],
    age: 31,
    occupation: "Relationship Therapist",
    yearsExperience: 8,
    languages: ["English", "Hindi", "Punjabi"],
    successStories: [
      "Helped a shy final-year student turn a long texting phase into an exclusive relationship in six weeks.",
      "Built a step-by-step confidence plan for a student after repeated ghosting and got them back into dating comfortably."
    ],
    testimonials: [
      { name: "Nitya A.", text: "Her texting framework was so clear that I stopped second-guessing every reply.", rating: 5 },
      { name: "Harsh V.", text: "The mock first-date prep was the difference between awkward and smooth.", rating: 5 },
      { name: "Mehak P.", text: "Direct, practical, and zero cringe. Exactly what I needed.", rating: 5 }
    ],
    sessionDuration: 60
  },
  {
    _id: "coach-rohan-mehta",
    name: "Dr. Rohan Mehta",
    title: "Breakup Recovery Expert",
    bio: "Licensed mentor focused on emotional reset plans, no-contact strategy, self-worth rebuilding, and closure after campus heartbreak.",
    specialization: ["Breakups", "Healing", "Boundaries"],
    consultationTypes: ["chat", "video", "call"],
    pricePerSession: 1999,
    rating: 4.8,
    reviewsCount: 243,
    sessionsCompleted: 910,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop",
    badges: ["Licensed mentor", "24h follow-up"],
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&auto=format&fit=crop"
    ],
    age: 38,
    occupation: "Clinical Psychologist",
    yearsExperience: 11,
    languages: ["English", "Hindi"],
    successStories: [
      "Guided a student through a no-contact plan that ended a repeated on-off situationship cycle.",
      "Helped a final-year couple create healthier boundaries after a breakup so they could coexist without spiraling."
    ],
    testimonials: [
      { name: "Ishita R.", text: "He gave structure to a phase that felt impossible to manage alone.", rating: 5 },
      { name: "Kunal S.", text: "Straightforward advice, zero fluff, huge emotional relief.", rating: 5 },
      { name: "Aman J.", text: "The post-breakup reset plan genuinely helped me get my focus back.", rating: 5 }
    ],
    sessionDuration: 75
  },
  {
    _id: "coach-kiara-sethi",
    name: "Kiara Sethi",
    title: "Confidence Coach",
    bio: "Works on body language, self-image, and in-person charisma so students stop overthinking every interaction.",
    specialization: ["Confidence", "Body language", "Self-image"],
    consultationTypes: ["chat", "video"],
    pricePerSession: 1299,
    rating: 4.7,
    reviewsCount: 129,
    sessionsCompleted: 540,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop",
    badges: ["Fast response"],
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521235835563-5b8671b73d2b?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop"
    ],
    age: 29,
    occupation: "Dating Confidence Coach",
    yearsExperience: 6,
    languages: ["English", "Hindi", "Urdu"],
    successStories: [
      "Turned a student with severe approach anxiety into someone comfortable initiating conversations at events.",
      "Built a body-language routine that helped a client feel calmer before every in-person date."
    ],
    testimonials: [
      { name: "Rhea T.", text: "Her session gave me a realistic plan instead of generic confidence advice.", rating: 5 },
      { name: "Param G.", text: "I finally stopped freezing during first meetings.", rating: 5 },
      { name: "Sanya K.", text: "Super warm, practical, and sharp about what was actually holding me back.", rating: 5 }
    ],
    sessionDuration: 60
  },
  {
    _id: "coach-arjun-bedi",
    name: "Arjun Bedi",
    title: "Long Distance Expert",
    bio: "Specializes in college relationships across cities, trust-building, expectation-setting, and practical communication routines.",
    specialization: ["Long distance", "Trust", "Conflict repair"],
    consultationTypes: ["chat", "call"],
    pricePerSession: 1399,
    rating: 4.8,
    reviewsCount: 96,
    sessionsCompleted: 430,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop",
    badges: ["Structured plans"],
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=900&auto=format&fit=crop"
    ],
    age: 34,
    occupation: "Relationship Strategy Mentor",
    yearsExperience: 7,
    languages: ["English", "Hindi", "Punjabi"],
    successStories: [
      "Helped a couple across two cities rebuild trust after recurring miscommunication and missed calls.",
      "Created a weekly rhythm and boundary plan that cut long-distance fights drastically within one month."
    ],
    testimonials: [
      { name: "Naman D.", text: "Finally had a repeatable structure for a relationship that felt chaotic before.", rating: 5 },
      { name: "Pallavi S.", text: "He made long distance feel manageable instead of draining.", rating: 5 },
      { name: "Ritvik A.", text: "Very grounded, very actionable advice.", rating: 5 }
    ],
    sessionDuration: 60
  },
  {
    _id: "coach-naina-roy",
    name: "Naina Roy",
    title: "Flirting Expert",
    bio: "Turns dry conversations into playful chemistry without crossing lines or sounding scripted, especially for campus dating.",
    specialization: ["Flirting", "Messaging", "Chemistry"],
    consultationTypes: ["chat", "video"],
    pricePerSession: 1599,
    rating: 4.9,
    reviewsCount: 211,
    sessionsCompleted: 700,
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop",
    badges: ["Premium mentor", "Most booked"],
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&auto=format&fit=crop"
    ],
    age: 30,
    occupation: "Dating Communication Coach",
    yearsExperience: 9,
    languages: ["English", "Hindi", "Bengali"],
    successStories: [
      "Helped a student recover a dead conversation and turn it into a successful campus date within ten days.",
      "Reworked a client's messaging style so they stopped sounding rehearsed and started sounding natural."
    ],
    testimonials: [
      { name: "Shreya L.", text: "She helped me sound like myself, just better.", rating: 5 },
      { name: "Dev M.", text: "My chat game got sharper immediately without feeling fake.", rating: 5 },
      { name: "Tanya R.", text: "Best mentor if you overthink every message before sending.", rating: 5 }
    ],
    sessionDuration: 60
  }
];

export const getDemoStudentSeed = (name?: string, index = 0) => {
  const normalized = normalize(name);
  return (
    DEMO_STUDENT_SEEDS.find((entry) => normalize(entry.name) === normalized) ||
    DEMO_STUDENT_SEEDS[index % DEMO_STUDENT_SEEDS.length]
  );
};

export const getDemoCoachSeed = (name?: string, index = 0) => {
  const normalized = normalize(name);
  return (
    DEMO_COACH_SEEDS.find((entry) => normalize(entry.name) === normalized) ||
    DEMO_COACH_SEEDS[index % DEMO_COACH_SEEDS.length]
  );
};

export const buildPhotoGallery = (photos: Array<string | undefined> | undefined, fallbackImages: string[]) => {
  const merged = uniqueStrings([...(photos || []), ...fallbackImages]);
  return merged.slice(0, 5);
};