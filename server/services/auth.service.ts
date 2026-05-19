import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signJwt } from "../utils/jwt";

const DEV_ADMIN_EMAIL = "admin@campuscrush.dev";
const DEV_ADMIN_PASSWORD = "Admin@123";

const ensureDevAdminUser = async () => {
  let adminUser = await User.findOne({ email: DEV_ADMIN_EMAIL });
  if (adminUser) {
    return adminUser;
  }

  const passwordHash = await bcrypt.hash(DEV_ADMIN_PASSWORD, 10);
  adminUser = await User.create({
    fullName: "Campus Crush Admin",
    email: DEV_ADMIN_EMAIL,
    university: "Campus Crush",
    role: "admin",
    verificationStatus: "verified",
    passwordHash
  });

  return adminUser;
};

const buildSafeUser = (user: any) => {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    age: user.age || null,
    university: user.university,
    department: user.department || "",
    graduationYear: user.graduationYear || null,
    relationshipGoals: user.relationshipGoals || "",
    gender: user.gender || "",
    city: user.city || "",
    height: user.height || "",
    spotifyUrl: user.spotifyUrl || "",
    instagramUrl: user.instagramUrl || "",
    role: user.role,
    verificationStatus: user.verificationStatus,
    bio: user.bio || "",
    interests: user.interests || [],
    photos: user.photos || [],
    prompts: user.prompts || [],
    blockedUsers: user.blockedUsers || [],
    profileViews: user.profileViews || 0,
    location: user.location || null
  };
};

export const toSafeUser = buildSafeUser;

const ALLOWED_EMAIL_DOMAINS = [
  "anurag.edu.in",
  "christuniversity.in",
  "kluniversity.in",
  "lpu.in",
  "mallareddyuniversity.ac.in",
  "marwadiuniversity.ac.in",
  "paruluniversity.ac.in",
  "srmap.edu.in",
  "vitapstudent.ac.in",
];

// REGISTER USER
export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
  university: string;
}) => {
  const emailLower  = payload.email.trim().toLowerCase();
  const emailDomain = emailLower.split("@")[1] ?? "";

  if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
    throw new Error(
      `Email domain @${emailDomain || "?"} is not supported. Please use your official college email.`
    );
  }

  const existing = await User.findOne({ email: emailLower });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    10
  );

  const user = await User.create({
    fullName: payload.fullName,
    email: emailLower,
    university: payload.university,
    passwordHash
  });

  return {
    user: buildSafeUser(user),
    token: signJwt(user.id)
  };
};

// LOGIN USER
export const loginUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const loginEmail = normalizedEmail === "admin" ? DEV_ADMIN_EMAIL : normalizedEmail;

  let user = await User.findOne({
    email: loginEmail
  });

  if (!user && normalizedEmail === "admin") {
    user = await ensureDevAdminUser();
  }

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.passwordHash) {
    throw new Error("Use Google sign-in for this account");
  }

  const isMatch = await bcrypt.compare(
    normalizedPassword,
    user.passwordHash
  );

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return {
    user: buildSafeUser(user),
    token: signJwt(user.id)
  };
};