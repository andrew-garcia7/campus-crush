export interface NavItem {
  label: string;
  href: string;
}

export const COLLEGE_DOMAINS = [
  { name: "Anurag University",             domain: "anurag.edu.in" },
  { name: "Christ University",             domain: "christuniversity.in" },
  { name: "KL University",                 domain: "kluniversity.in" },
  { name: "Lovely Professional University", domain: "lpu.in" },
  { name: "Mallareddy University",         domain: "mallareddyuniversity.ac.in" },
  { name: "Marwadi University",            domain: "marwadiuniversity.ac.in" },
  { name: "Parul University",              domain: "paruluniversity.ac.in" },
  { name: "SRM AP University",             domain: "srmap.edu.in" },
  { name: "VITAP University",              domain: "vitapstudent.ac.in" },
] as const;

export const navItems: NavItem[] = [
  { label: "Discover", href: "/discover" },
  { label: "Matches", href: "/match-success" },
  { label: "Chat", href: "/chat" },
  { label: "Coach", href: "/coach" },
  { label: "Profile", href: "/profile" }
];

export const CAMPUS_PROMPTS = [
  "Best late night campus spot?",
  "Your biggest red flag?",
  "What makes you instantly attractive?",
  "Coffee date or library date?",
  "One thing you can't leave campus without?",
  "I'll fall for you if you can...",
  "Best canteen order, fight me.",
  "The way to my heart is through...",
  "Ideal first date on campus?",
  "I'm weirdly competitive about...",
  "The song I'd play on our first drive?",
  "Hot take about campus life?",
  "My love language in three words?",
  "I'm secretly good at...",
  "What I'm looking for right now?",
  "Change my mind about...",
  "Best part of my morning routine?",
  "My most controversial opinion?",
  "I'd cancel a lecture for...",
  "What my Spotify Wrapped says about me?",
  "The most unhinged thing I've done on campus?",
  "Describe yourself in three emojis",
  "Bucket list before graduation?",
  "I always choose... (introvert or extrovert?)",
  "Something I judge people for instantly?",
  "Best thing about my university?",
  "My go-to stress reliever?",
  "I'm a morning person / night owl because...",
  "My love for... is a personality trait.",
  "The nerd in me comes out when...",
  "I know too much about...",
  "A skill I picked up out of boredom?",
  "Best recommendation: movie, show, or song?",
  "I can't function without...",
  "Something my friends always tease me about?",
  "My campus crush story (no names)?",
  "The fastest way to lose my interest?",
  "Last thing I googled at 2am?",
  "I never thought I'd end up studying...",
  "My most-used campus shortcut?",
  "A random fact I know by heart?",
  "I'm lowkey obsessed with...",
  "Biggest plot twist of my college life?",
  "If I could swap courses with anyone...",
  "I wish people asked me about...",
  "My campus era in one word?",
  "The most relatable thing about me?",
  "One thing I'd change about my uni?",
  "My biggest flex right now?",
  "Ask me about...",
] as const;

