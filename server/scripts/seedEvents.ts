import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Event } from "../models/Event";
import { User } from "../models/User";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/campuscrush";

const EVENTS = [
  { title: "Spring Fest 2026", category: "fest", venue: "Main Amphitheatre", description: "The biggest campus festival of the year with live music, food stalls, and fun activities!", tags: ["fest", "music", "food"], date: new Date("2026-05-15"), time: "5:00 PM" },
  { title: "Valentine's Speed Dating", category: "dating", venue: "Garden Café", description: "Meet your campus crush in a fun speed-dating event. 15 rounds, 2 minutes each!", tags: ["dating", "love", "social"], date: new Date("2026-05-20"), time: "7:00 PM" },
  { title: "Hackathon 2026", category: "hackathon", venue: "Innovation Lab", description: "48-hour hackathon to build the next big thing. Solo or team of 4. Cash prizes!", tags: ["tech", "code", "prizes"], date: new Date("2026-05-22"), time: "9:00 AM" },
  { title: "Late Night Concert", category: "concert", venue: "Open Air Theatre", description: "Chill vibes, live bands, fairy lights. The perfect campus night out.", tags: ["music", "concert", "night"], date: new Date("2026-05-25"), time: "8:00 PM" },
  { title: "AI & ML Workshop", category: "workshop", venue: "Tech Block B203", description: "Hands-on AI/ML workshop for beginners. Learn Python, TensorFlow, and more.", tags: ["AI", "ML", "tech"], date: new Date("2026-05-28"), time: "10:00 AM" },
  { title: "Campus Meetup 🎉", category: "meetup", venue: "Student Union", description: "Casual hangout for all campus crush users. Make new friends, find your match!", tags: ["social", "meetup", "friends"], date: new Date("2026-06-01"), time: "4:00 PM" },
  { title: "Cultural Night", category: "cultural", venue: "Main Stage", description: "Celebrate campus diversity with dance, music, and food from different cultures.", tags: ["culture", "dance", "food"], date: new Date("2026-06-05"), time: "6:30 PM" },
  { title: "Photography Walk", category: "meetup", venue: "Campus Gardens", description: "Explore the campus together, click portraits, create memories. DSLR or phone welcome!", tags: ["photography", "art", "social"], date: new Date("2026-06-08"), time: "7:00 AM" },
  { title: "Sports Carnival", category: "sports", venue: "Sports Complex", description: "Cricket, football, basketball, and more. Find your sporty campus crush!", tags: ["sports", "fitness", "fun"], date: new Date("2026-06-10"), time: "3:00 PM" },
  { title: "Startup Pitch Night", category: "workshop", venue: "Auditorium Hall 1", description: "Present your startup idea to real investors. 5-minute pitches, Q&A, networking.", tags: ["startup", "business", "networking"], date: new Date("2026-06-12"), time: "5:00 PM" },
];

const UNIVERSITIES = ["LPU", "Amity University", "VIT Vellore", "SRM Chennai", "Manipal University"];
const COVERS = [
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600",
  "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
  "https://images.unsplash.com/photo-1559523161-0fc0d8b814a3?w=600",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600",
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await Event.deleteMany({});
  console.log("🧹 Cleared old events");

  // Get any user as organizer
  const anyUser = await User.findOne({ email: { $regex: /@seed\.campuscrush\.dev$/ } });
  const organizerId = anyUser?._id || new mongoose.Types.ObjectId();

  const events = EVENTS.map((e, i) => ({
    ...e,
    university: UNIVERSITIES[i % UNIVERSITIES.length],
    coverImage: COVERS[i % COVERS.length],
    organizer: organizerId,
    attendees: [],
    maxAttendees: Math.floor(Math.random() * 100) + 50,
    isPublic: true,
  }));

  await Event.insertMany(events);
  console.log(`🎉 Seeded ${events.length} events`);
  await mongoose.disconnect();
  console.log("✅ Done");
}

seed().catch((e) => { console.error(e); process.exit(1); });
