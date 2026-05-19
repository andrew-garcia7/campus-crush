export type SearchOption = {
  value: string;
  label: string;
  searchText?: string;
};

export type InterestCategory = {
  name: string;
  icon: string;
  items: string[];
};

export const GENDER_OPTIONS: SearchOption[] = [
  { value: "man",              label: "Man"              },
  { value: "woman",            label: "Woman"            },
  { value: "non-binary",       label: "Non-binary"       },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const AGE_OPTIONS: SearchOption[] = Array.from({ length: 18 }, (_, index) => {
  const age = 18 + index;
  return { value: String(age), label: String(age) };
});

export const HEIGHT_OPTIONS: SearchOption[] = Array.from({ length: 29 }, (_, index) => {
  const totalInches = 56 + index;
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const label = `${feet}'${inches}`;
  return { value: label, label, searchText: `${feet} ${inches} ${totalInches}` };
});

export const RELATIONSHIP_GOAL_OPTIONS: SearchOption[] = [
  "Serious relationship",
  "Casual dating",
  "Friends first",
  "Still figuring it out"
].map((value) => ({ value, label: value }));

export const UNIVERSITY_OPTIONS: SearchOption[] = [
  { value: "Lovely Professional University", label: "Lovely Professional University", searchText: "LPU Phagwara Jalandhar Punjab" },
  { value: "LPU", label: "LPU", searchText: "Lovely Professional University Phagwara Jalandhar Punjab" },
  { value: "DAV University", label: "DAV University", searchText: "Jalandhar Punjab DAV" },
  { value: "Guru Nanak Dev University", label: "Guru Nanak Dev University", searchText: "GNDU Amritsar Punjab" },
  { value: "IK Gujral Punjab Technical University", label: "IK Gujral Punjab Technical University", searchText: "IKGPTU PTU Kapurthala Punjab" },
  { value: "Punjab Agricultural University", label: "Punjab Agricultural University", searchText: "PAU Ludhiana Punjab" },
  { value: "Chandigarh University", label: "Chandigarh University", searchText: "Mohali Punjab CU" },
  { value: "Thapar Institute of Engineering and Technology", label: "Thapar Institute of Engineering and Technology", searchText: "TIET Patiala Punjab" },
  { value: "Panjab University", label: "Panjab University", searchText: "Chandigarh PU" },
  { value: "Amity University Noida", label: "Amity University Noida", searchText: "Amity Noida" },
  { value: "VIT Vellore", label: "VIT Vellore", searchText: "VIT Tamil Nadu" },
  { value: "SRM University", label: "SRM University", searchText: "SRM Chennai Kattankulathur" },
  { value: "Manipal University Jaipur", label: "Manipal University Jaipur", searchText: "MUJ Jaipur Rajasthan" },
  { value: "Delhi University", label: "Delhi University", searchText: "DU Delhi" }
];

export const DEPARTMENT_OPTIONS: SearchOption[] = [
  { value: "B.Tech Computer Science and Engineering", label: "B.Tech Computer Science and Engineering", searchText: "CSE engineering" },
  { value: "Information Technology", label: "Information Technology", searchText: "IT" },
  { value: "Artificial Intelligence and Data Science", label: "Artificial Intelligence and Data Science", searchText: "AI DS machine learning" },
  { value: "Cyber Security", label: "Cyber Security", searchText: "security infosec" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering", searchText: "ME" },
  { value: "Civil Engineering", label: "Civil Engineering", searchText: "CE" },
  { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering", searchText: "ECE electronics communication" },
  { value: "Architecture", label: "Architecture", searchText: "B.Arch" },
  { value: "MBA", label: "MBA", searchText: "business administration masters" },
  { value: "BBA", label: "BBA", searchText: "business administration bachelors" },
  { value: "Commerce", label: "Commerce", searchText: "B.Com accounting finance" },
  { value: "Finance", label: "Finance", searchText: "banking accounting" },
  { value: "Marketing", label: "Marketing", searchText: "brand management" },
  { value: "Law", label: "Law", searchText: "LLB legal" },
  { value: "Psychology", label: "Psychology", searchText: "mental health behavior" },
  { value: "English Literature", label: "English Literature", searchText: "literature arts" },
  { value: "Journalism and Mass Communication", label: "Journalism and Mass Communication", searchText: "media communication JMC" },
  { value: "Fashion Design", label: "Fashion Design", searchText: "design styling" },
  { value: "Interior Design", label: "Interior Design", searchText: "spaces design" },
  { value: "Biotechnology", label: "Biotechnology", searchText: "biotech life sciences" },
  { value: "Pharmacy", label: "Pharmacy", searchText: "B.Pharm pharma" },
  { value: "Hotel Management", label: "Hotel Management", searchText: "hospitality tourism" },
  { value: "Agriculture", label: "Agriculture", searchText: "farming agri" },
  { value: "Physiotherapy", label: "Physiotherapy", searchText: "rehab health" }
];

export const GRADUATION_YEAR_OPTIONS: SearchOption[] = Array.from({ length: 12 }, (_, index) => {
  const year = 2024 + index;
  return { value: String(year), label: String(year) };
});

export const SPOTIFY_URL_SUGGESTIONS = [
  { value: "https://open.spotify.com/user/your-profile", label: "Spotify profile", searchText: "profile account" },
  { value: "https://open.spotify.com/playlist/your-favorite-playlist", label: "Favorite playlist", searchText: "playlist songs mix" },
  { value: "https://open.spotify.com/track/your-current-anthem", label: "Current anthem", searchText: "track song music" },
  { value: "https://open.spotify.com/artist/your-favorite-artist", label: "Favorite artist", searchText: "artist musician" }
];

export const INSTAGRAM_URL_SUGGESTIONS = [
  { value: "https://instagram.com/yourhandle", label: "Instagram handle", searchText: "username profile" },
  { value: "https://www.instagram.com/yourhandle", label: "Instagram profile URL", searchText: "profile full url" },
  { value: "https://instagram.com/your.college.life", label: "Campus vibe page", searchText: "college campus aesthetic" },
  { value: "https://instagram.com/your.photodump", label: "Photo dump page", searchText: "photos gallery" }
];

export const BIO_PROMPT_SUGGESTIONS = [
  "Campus coffee runs, late-night playlists, and conversations that actually go somewhere.",
  "Usually between class, gym, and finding the best chai spot on campus.",
  "Looking for someone who can match energy, banter, and spontaneous food plans.",
  "Equal parts ambitious, romantic, and always down for a campus walk at golden hour."
];

export const INTEREST_CATEGORIES: InterestCategory[] = [
  { name: "Music", icon: "🎵", items: ["Afrobeats", "Indie Music", "Lo-fi", "Bollywood", "K-pop", "Jazz", "Concerts", "DJ Nights"] },
  { name: "Gaming", icon: "🎮", items: ["Valorant", "BGMI", "FIFA", "Minecraft", "Story Games", "Console Gaming", "Esports", "Retro Games"] },
  { name: "Coding", icon: "💻", items: ["Hackathons", "Web Dev", "AI Builders", "Open Source", "UI Design", "App Ideas", "Dev Memes", "Late-night Coding"] },
  { name: "Startups", icon: "🚀", items: ["Pitch Nights", "Founder Life", "Product Design", "Networking", "Building SaaS", "Side Hustles", "Marketing", "Leadership"] },
  { name: "Gym", icon: "🏋️", items: ["Weightlifting", "Powerlifting", "Protein Coffee", "Leg Day", "Morning Workouts", "Core Training", "Fitness Reels", "Workout Dates"] },
  { name: "Fitness", icon: "⚡", items: ["Running", "Pilates", "CrossFit", "Wellness", "Healthy Eating", "Step Goals", "Home Workouts", "Mobility"] },
  { name: "Anime", icon: "✨", items: ["Shonen", "Romance Anime", "Studio Ghibli", "Cosplay", "Anime Edits", "Manga", "Anime OSTs", "Conventions"] },
  { name: "Movies", icon: "🎬", items: ["Rom-coms", "Thrillers", "A24", "Sci-fi", "Marvel", "Horror", "Movie Nights", "Film Analysis"] },
  { name: "Travel", icon: "✈️", items: ["Road Trips", "Weekend Getaways", "Backpacking", "Beach Escapes", "Mountains", "City Walks", "Travel Vlogs", "Passport Goals"] },
  { name: "Photography", icon: "📸", items: ["Portraits", "Street Photography", "Film Camera", "Campus Shots", "Travel Photos", "Editing", "Photo Walks", "Golden Hour"] },
  { name: "Dance", icon: "💃", items: ["Hip Hop", "Contemporary", "Salsa", "Freestyle", "Dance Reels", "College Choreo", "Bollywood Dance", "Bhangra"] },
  { name: "Books", icon: "📚", items: ["Romance Novels", "Self-help", "Fantasy", "Poetry Books", "BookTok", "Mystery", "Campus Library", "Reading Dates"] },
  { name: "Sports", icon: "🏅", items: ["Badminton", "Table Tennis", "Athletics", "Swimming", "Sports Nights", "Campus Leagues", "Adventure Sports", "Sports Banter"] },
  { name: "Cricket", icon: "🏏", items: ["IPL", "Gully Cricket", "Match Analysis", "Net Practice", "Cricket Memes", "Fantasy League", "Test Cricket", "Sixes Only"] },
  { name: "Football", icon: "⚽", items: ["Premier League", "Champions League", "Five-a-side", "Penalty Shots", "Football Banter", "Late-night Matches", "Jersey Culture", "Striker Energy"] },
  { name: "Basketball", icon: "🏀", items: ["NBA", "3v3", "Sneaker Drops", "Hoop Sessions", "Streetball", "Highlight Reels", "Clutch Plays", "Courtside Vibes"] },
  { name: "Fashion", icon: "🖤", items: ["Streetwear", "Minimal Looks", "Luxury Fits", "Campus Style", "Jewelry", "Sneaker Styling", "Pinterest Outfits", "Vintage Fashion"] },
  { name: "Luxury", icon: "💎", items: ["Fine Dining", "Luxury Travel", "Designer Finds", "Aesthetic Cafes", "Premium Skincare", "Fragrance Collecting", "Champagne Taste", "Soft Life"] },
  { name: "Cars", icon: "🏎️", items: ["Night Drives", "Car Meets", "Supercars", "Vintage Cars", "Road Trips", "Drifting", "F1", "Bike Rides"] },
  { name: "Memes", icon: "😂", items: ["Dank Memes", "Campus Memes", "Twitter Humor", "Inside Jokes", "Reaction Memes", "Chaotic Humor", "Dark Humor", "Meme Pages"] },
  { name: "Art", icon: "🎨", items: ["Sketching", "Digital Art", "Canvas Painting", "Gallery Dates", "Illustration", "Creative Journals", "Aesthetic Posters", "Ceramics"] },
  { name: "Singing", icon: "🎤", items: ["Karaoke", "Acoustic Covers", "Choir", "Open Mics", "Studio Sessions", "Indie Vocals", "Love Songs", "Riff Battles"] },
  { name: "Guitar", icon: "🎸", items: ["Acoustic Guitar", "Electric Guitar", "Jam Sessions", "Indie Covers", "Songwriting", "Campus Gigs", "Bedroom Music", "Fingerstyle"] },
  { name: "Coffee", icon: "☕", items: ["Cold Brew", "Cafe Hopping", "Coffee Dates", "Espresso Shots", "Study Cafe", "Latte Art", "Late-night Coffee", "Matcha Too"] },
  { name: "Poetry", icon: "📝", items: ["Spoken Word", "Urdu Poetry", "Love Letters", "Open Mic Nights", "Slam Poetry", "Journaling", "Poetic Captions", "Rainy Day Writing"] },
  { name: "Business", icon: "📈", items: ["Case Competitions", "Consulting", "Pitch Decks", "Brand Strategy", "Negotiation", "Sales", "Founder Podcasts", "Market Trends"] },
  { name: "Finance", icon: "💹", items: ["Investing", "Stock Market", "Wealth Building", "Business News", "Personal Finance", "Finfluencers", "Economics", "Budget Planning"] },
  { name: "Crypto", icon: "🪙", items: ["Bitcoin", "Altcoins", "On-chain", "Crypto Twitter", "NFT Culture", "DeFi", "Web3 Builders", "Market Charts"] },
  { name: "Cooking", icon: "🍜", items: ["Pasta Nights", "Baking", "Air Fryer Recipes", "Fusion Food", "Midnight Maggi", "Meal Prep", "Food Videos", "Dessert Dates"] },
  { name: "Pets", icon: "🐾", items: ["Dogs", "Cats", "Pet Cafes", "Animal Rescue", "Puppy Reels", "Aquariums", "Bird Watching", "Horse Riding"] },
  { name: "Spirituality", icon: "🕊️", items: ["Meditation", "Manifesting", "Temple Visits", "Mindfulness", "Tarot Curiosity", "Healing Music", "Breathwork", "Journaling Rituals"] },
  { name: "Adventure", icon: "🌄", items: ["Trekking", "Camping", "Ziplining", "Long Rides", "Sunrise Plans", "Offbeat Trips", "Bonfire Nights", "Thrill Seeking"] }
];