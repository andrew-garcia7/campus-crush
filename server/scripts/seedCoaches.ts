import mongoose from "mongoose";
import dotenv from "dotenv";
import { Coach } from "../models/Coach";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/campuscrush";

const coaches = [
  {
    name: "Aanya Kapoor",
    title: "First Date Expert",
    bio: "Helps students go from awkward texting to confident first dates with clear, campus-friendly playbooks.",
    specialization: ["First dates", "Texting confidence", "Ice breakers"],
    consultationTypes: ["chat", "video"],
    pricePerSession: 1499,
    rating: 4.9,
    reviewsCount: 187,
    sessionsCompleted: 620,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
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
    sessionDuration: 60,
    badges: ["Top rated", "Campus favorite"],
    isFeatured: true
  },
  {
    name: "Dr. Rohan Mehta",
    title: "Breakup Recovery Expert",
    bio: "Licensed relationship mentor focused on emotional reset plans, no-contact strategy, and self-worth rebuilding.",
    specialization: ["Breakups", "Healing", "Boundaries"],
    consultationTypes: ["chat", "video", "call"],
    pricePerSession: 1999,
    rating: 4.8,
    reviewsCount: 243,
    sessionsCompleted: 910,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
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
    sessionDuration: 75,
    badges: ["Licensed mentor", "24h follow-up"],
    isFeatured: true
  },
  {
    name: "Kiara Sethi",
    title: "Confidence Coach",
    bio: "Works on body language, self-image, and in-person charisma so students stop overthinking every interaction.",
    specialization: ["Confidence", "Body language", "Self-image"],
    consultationTypes: ["chat", "video"],
    pricePerSession: 1299,
    rating: 4.7,
    reviewsCount: 129,
    sessionsCompleted: 540,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
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
    sessionDuration: 60,
    badges: ["Fast response"],
    isFeatured: false
  },
  {
    name: "Arjun Bedi",
    title: "Long Distance Expert",
    bio: "Specializes in college relationships across cities, trust-building, and practical communication routines.",
    specialization: ["Long distance", "Trust", "Conflict repair"],
    consultationTypes: ["chat", "call"],
    pricePerSession: 1399,
    rating: 4.8,
    reviewsCount: 96,
    sessionsCompleted: 430,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
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
    sessionDuration: 60,
    badges: ["Structured plans"],
    isFeatured: false
  },
  {
    name: "Naina Roy",
    title: "Flirting Expert",
    bio: "Turns dry conversations into playful chemistry without crossing lines or sounding scripted.",
    specialization: ["Flirting", "Messaging", "Chemistry"],
    consultationTypes: ["chat", "video"],
    pricePerSession: 1599,
    rating: 4.9,
    reviewsCount: 211,
    sessionsCompleted: 700,
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
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
    sessionDuration: 60,
    badges: ["Premium mentor", "Most booked"],
    isFeatured: true
  },
  {
    name: "Sara Iqbal",
    title: "Marriage Advisor",
    bio: "For serious couples navigating commitment, family pressure, future planning, and healthy communication.",
    specialization: ["Commitment", "Family pressure", "Communication"],
    consultationTypes: ["video", "call"],
    pricePerSession: 2499,
    rating: 4.9,
    reviewsCount: 84,
    sessionsCompleted: 260,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop"
    ],
    age: 41,
    occupation: "Marriage Advisor",
    yearsExperience: 14,
    languages: ["English", "Hindi", "Urdu"],
    successStories: [
      "Helped a serious campus couple navigate family pressure and move toward an engagement conversation.",
      "Created a future-planning framework for partners who were aligned emotionally but stuck on practical decisions."
    ],
    testimonials: [
      { name: "Areeba F.", text: "Her calm approach made difficult conversations much easier to have.", rating: 5 },
      { name: "Raghav B.", text: "Great for couples who want structure, not just motivation.", rating: 5 },
      { name: "Nisha K.", text: "Very thoughtful and deeply experienced.", rating: 5 }
    ],
    sessionDuration: 90,
    badges: ["High trust"],
    isFeatured: false
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await Coach.deleteMany({});
  console.log("🧹 Cleared old coaches");

  await Coach.insertMany(coaches);
  console.log(`🌱 Seeded ${coaches.length} coaches`);

  await mongoose.disconnect();
  console.log("✅ Done");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});