import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/campuscrush";

const schema = new mongoose.Schema(
  { university: String, text: String, likes: { type: Number, default: 0 } },
  { timestamps: true }
);
const Confession = mongoose.models.Confession || mongoose.model("Confession", schema);

const universities = ["LPU", "Amity University", "VIT Vellore", "SRM Chennai", "Manipal University"];
const categories = ["confession", "crush-story", "breakup", "funny", "library", "fest", "hostel"];

const confessions = [
  "I've been to the same cafe every morning for 3 months just to see the same person. Never said a word. 😭",
  "I pretend to study in the library but I'm actually watching the person across from me for hours.",
  "I once failed a quiz because the person I have a crush on sat next to me and I couldn't focus at all.",
  "My entire college experience is 70% academics and 30% planning ways to bump into my crush accidentally.",
  "I changed my timetable just to have the same lunch break as someone I liked. It didn't even work out.",
  "I've rehearsed asking someone to the campus fest 47 times in my head. Still haven't done it.",
  "Sent a connection request on LinkedIn to someone I've been too scared to talk to IRL.",
  "I know my crush's entire schedule by heart but I don't know half my professors' names.",
  "Started learning guitar just because my crush mentioned they find it attractive. Now I actually love it.",
  "I pretend to be on a call whenever I walk past my ex's hostel block.",
  "The only reason I joined the photography club was to spend more time with someone. We never even spoke properly.",
  "I've been 'coincidentally' choosing the same project group as my crush for two semesters straight.",
  "I'm in 3 extra-curricular activities I have zero interest in, all because of one person.",
  "Made a whole fake Spotify playlist to show my crush how good my music taste is. It worked.",
  "I went to the gym for the first time in my life when I found out my crush goes at 6am. I am not a morning person.",
  "I moved seats 4 times in a lecture hall to be one row behind my crush. The professor noticed.",
  "Spent ₹800 at the campus canteen just to keep sitting near the person I like. Worth every rupee.",
  "I've memorized exactly what my crush orders at the chai stall. Hot masala, no sugar.",
  "I stayed back an extra hour in lab pretending to finish work just so we could walk to the bus stop together.",
  "Told my friends I was going to the library. I was actually just following my crush's Insta stories in real time.",
  "I failed a surprise test because my crush sat next to me and I spent the whole time hoping they'd ask for a pen.",
  "Accidentally liked a 2-year-old photo while stalking someone's profile. I immediately dropped my phone.",
  "I requested the same optional elective as someone I liked, not knowing it was the most boring course in the entire university.",
  "The only reason I attend the 8am lecture is them. I don't understand a single thing being taught.",
  "I once ran into a glass door walking into the cafeteria because I wasn't watching where I was going — too busy staring.",
  "Someone smiled at me in the corridor and I thought about it for three days straight.",
  "I made my friend follow my crush on Instagram just so I could see their profile stories without being obvious.",
  "Joined the college debate team hoping to impress someone. Turned out they joined the art club. I'm still in debate.",
  "My crush said 'nice shoes' once in passing and I have worn those shoes every day since.",
  "I've typed and deleted the same 'hey' message to someone for 6 months. Still unsent."
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  await Confession.deleteMany({});
  console.log("🧹 Cleared old confessions");

  const docs = Array.from({ length: 100 }).map((_, i) => {
    const base = confessions[i % confessions.length];
    const variants = [
      `${base} Also, this happened near ${["the library", "the amphitheatre", "the hostel gate", "the fest ground", "the coding lab"][i % 5]}.`,
      `${base} My friends still don't know this part: ${["I smiled and walked away", "I panicked and pretended to take a call", "they actually noticed me", "I wrote it in my notes app immediately", "I changed routes the next day"][i % 5]}.`,
      `${base} This is my official ${["semester", "hostel", "canteen", "late-night", "campus fest"][i % 5]} confession.`
    ];

    return {
      text: variants[i % variants.length],
      university: universities[i % universities.length],
      category: categories[i % categories.length],
      likesCount: Math.floor(Math.random() * 120) + 5,
      sharesCount: Math.floor(Math.random() * 40),
      reportsCount: Math.floor(Math.random() * 3),
      comments: Array.from({ length: i % 4 }, (_value, index) => ({
        text: ["So relatable", "This is wild", "You need to tell them", "Campus lore unlocked"][index % 4],
        createdAt: new Date(Date.now() - (index + 1) * 1000 * 60 * 90)
      })),
      createdAt: new Date(Date.now() - i * 1000 * 60 * 45),
      updatedAt: new Date(Date.now() - i * 1000 * 60 * 20)
    };
  });

  await Confession.insertMany(docs);
  console.log(`🌱 Seeded ${docs.length} confessions`);

  await mongoose.disconnect();
  console.log("✅ Done");
}

seed().catch((e) => { console.error(e); process.exit(1); });
