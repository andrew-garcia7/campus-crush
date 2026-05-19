import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/campuscrush";

const schema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  age: Number,
  university: String,
  gender: String,
  role: { type: String, default: "student" },
  verificationStatus: { type: String, default: "verified" },
  bio: String,
  interests: [String],
  photos: [String],
  location: { lat: Number, lng: Number, zone: String },
  isBanned: { type: Boolean, default: false },
  studentIdUrl: String,
  selfieUrl: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", schema);

// Realistic campus student photos from Unsplash
const femalePhotos = [
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600",
  "https://images.unsplash.com/photo-1550525811-e5869dd03032?w=600",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600",
  "https://images.unsplash.com/photo-1502323703110-f2253f546c5e?w=600",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
  "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=600",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600",
  "https://images.unsplash.com/photo-1515378791036-0648a814c963?w=600",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600",
  "https://images.unsplash.com/photo-1505033575518-a36ea2ef75ae?w=600",
  "https://images.unsplash.com/photo-1521235835563-5b8671b73d2b?w=600",
  "https://images.unsplash.com/photo-1533636721434-0e2d61030955?w=600",
  "https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=600",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
  "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600",
  "https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=600"
];

const malePhotos = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600",
  "https://images.unsplash.com/photo-1520409364224-63400afe26e5?w=600",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600",
  "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?w=600",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600",
  "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600",
  "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=600",
  "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=600",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600",
  "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=600",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
  "https://images.unsplash.com/photo-1583195764036-46b5b5b3b35a?w=600",
  "https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=600",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=600",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600",
  "https://images.unsplash.com/photo-1601233749202-95d04d5b3c00?w=600"
];

const femaleNames = [
  "Priya Sharma","Ananya Singh","Riya Kapoor","Sneha Gupta","Kavya Reddy",
  "Pooja Nair","Divya Menon","Neha Joshi","Aditi Patel","Simran Kaur",
  "Meghna Das","Ishaan Verma","Tanvi Desai","Ritu Agarwal","Shruti Iyer",
  "Nandini Rao","Pallavi Mishra","Sakshi Tiwari","Deepika Pillai","Komal Srivastava",
  "Mansi Bhatt","Ankita Dubey","Prachi Saxena","Varsha Yadav","Kritika Malhotra"
];

const maleNames = [
  "Arjun Kumar","Rohit Sharma","Vikram Singh","Aditya Patel","Karan Mehta",
  "Rahul Gupta","Dev Chopra","Nikhil Verma","Siddharth Nair","Aman Kapoor",
  "Raj Malhotra","Ishaan Reddy","Yash Joshi","Kartik Bose","Akash Tiwari",
  "Shubham Mishra","Pranav Iyer","Dhruv Pillai","Gaurav Sinha","Ankit Rao",
  "Sumit Sharma","Tarun Dixit","Nitin Saxena","Ritesh Yadav","Varun Agarwal"
];

const bios = [
  "Coffee addict ☕ | DSA grind | Looking for study buddy",
  "Music lover 🎵 | Campus photographer | Swipe right if you like sunsets",
  "Gym rat 💪 | Engineering student | Looking for someone to explore the city with",
  "Bookworm 📚 | Part-time poet | Chai over coffee always",
  "Foodie first, student second 🍕 | Let's grab campus canteen specials",
  "Debate club president 🎙 | Passionate about tech startups",
  "Art major 🎨 | Late night chai sessions are my vibe",
  "Gaming enthusiast 🎮 | CS student | Weekend trekker",
  "Yoga & vibes ✨ | Sustainable living | Laugh at my own jokes",
  "Future entrepreneur 🚀 | Netflix binge-watcher | Meme collector",
  "Dance team captain 💃 | Spreading good energy only",
  "Traveler at heart ✈️ | Maps major | Show me your playlist",
  "Coder by day, guitarist by night 🎸",
  "Campus activist 🌿 | Green tea enthusiast | Dog person forever",
  "Topper & proud 📖 | Also loves spontaneous road trips",
];

const interestSets = [
  ["Coding", "Music", "Coffee"],
  ["Photography", "Travel", "Yoga"],
  ["Gaming", "Anime", "Tech"],
  ["Dancing", "Art", "Movies"],
  ["Fitness", "Nutrition", "Hiking"],
  ["Books", "Poetry", "Tea"],
  ["Startups", "Finance", "Tennis"],
  ["Cooking", "Netflix", "Dogs"],
  ["Cricket", "Debate", "Politics"],
  ["Fashion", "Singing", "Café-hopping"],
];

const departments = [
  "Computer Science",
  "Business Administration",
  "Mechanical Engineering",
  "Psychology",
  "Fashion Design",
  "Media Studies",
  "Finance",
  "Architecture"
];

const relationshipGoals = ["Serious relationship", "Casual dating", "Friends first", "Still figuring it out"];

const universities = ["LPU", "Amity University", "VIT Vellore", "SRM Chennai", "Manipal University"];
const zones = ["Cafeteria", "Library", "Gym", "Main Block", "Hostel Zone", "Sports Ground"];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Remove existing seeded users
  await User.deleteMany({ email: /@seed\.campuscrush\.dev$/ });
  console.log("🧹 Cleared old seed data");

  const passwordHash = await bcrypt.hash("Seed@123", 10);
  const users: any[] = [];

  // 25 female profiles
  for (let i = 0; i < 25; i++) {
    users.push({
      fullName: femaleNames[i],
      email: `female${i + 1}@seed.campuscrush.dev`,
      passwordHash,
      age: 18 + (i % 5),
      gender: "female",
      university: universities[i % universities.length],
      department: departments[i % departments.length],
      graduationYear: 2026 + (i % 4),
      relationshipGoals: relationshipGoals[i % relationshipGoals.length],
      verificationStatus: "verified",
      bio: bios[i % bios.length],
      interests: interestSets[i % interestSets.length],
      photos: [femalePhotos[i], femalePhotos[(i + 7) % femalePhotos.length], femalePhotos[(i + 13) % femalePhotos.length]],
      location: { lat: 30.9 + i * 0.001, lng: 75.8 + i * 0.001, zone: zones[i % zones.length] },
      isBanned: false,
      studentIdUrl: "https://placehold.co/400x250?text=StudentID",
      selfieUrl: femalePhotos[i],
      profileViews: 20 + i * 3,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 6),
      updatedAt: new Date(Date.now() - i * 1000 * 60 * 20)
    });
  }

  // 25 male profiles
  for (let i = 0; i < 25; i++) {
    users.push({
      fullName: maleNames[i],
      email: `male${i + 1}@seed.campuscrush.dev`,
      passwordHash,
      age: 18 + (i % 5),
      gender: "male",
      university: universities[i % universities.length],
      department: departments[(i + 3) % departments.length],
      graduationYear: 2026 + (i % 4),
      relationshipGoals: relationshipGoals[(i + 1) % relationshipGoals.length],
      verificationStatus: "verified",
      bio: bios[(i + 5) % bios.length],
      interests: interestSets[(i + 3) % interestSets.length],
      photos: [malePhotos[i], malePhotos[(i + 8) % malePhotos.length], malePhotos[(i + 15) % malePhotos.length]],
      location: { lat: 30.9 + i * 0.001, lng: 75.85 + i * 0.001, zone: zones[(i + 2) % zones.length] },
      isBanned: false,
      studentIdUrl: "https://placehold.co/400x250?text=StudentID",
      selfieUrl: malePhotos[i],
      profileViews: 15 + i * 4,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 4),
      updatedAt: new Date(Date.now() - i * 1000 * 60 * 12)
    });
  }

  await User.insertMany(users, { ordered: false });
  console.log(`🌱 Seeded ${users.length} dummy users successfully`);
  await mongoose.disconnect();
  console.log("✅ Done");
}

seed().catch((e) => { console.error(e); process.exit(1); });
