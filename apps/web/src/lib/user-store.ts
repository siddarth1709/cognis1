import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  provider?: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Default demo users seeded for instant verification
const DEFAULT_DEMO_PASSWORD_HASH = bcrypt.hashSync("Password123!", 10);
const DEFAULT_USERS: StoredUser[] = [
  {
    id: "usr_cognis_operator_001",
    name: "Cognis Operator",
    email: "operator@cognis.dev",
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    provider: "credentials",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_cognis_admin_001",
    name: "Core Invariant Admin",
    email: "admin@cognis.dev",
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    provider: "credentials",
    createdAt: new Date().toISOString(),
  },
];

function ensureStorage(): StoredUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), "utf-8");
      return DEFAULT_USERS;
    }
    const content = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(content) as StoredUser[];

    // Ensure operator@cognis.dev exists even if users.json was created earlier
    if (!parsed.some((u) => u.email.toLowerCase() === "operator@cognis.dev")) {
      parsed.unshift(DEFAULT_USERS[0]);
      fs.writeFileSync(USERS_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users: StoredUser[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save users store:", err);
  }
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = ensureStorage();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  provider?: string;
}): Promise<StoredUser> {
  const users = ensureStorage();
  const normalized = data.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new Error("An account with this email address already exists.");
  }

  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim() || normalized.split("@")[0],
    email: normalized,
    passwordHash,
    provider: data.provider || "credentials",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export async function verifyUserPassword(user: StoredUser, passwordInput: string): Promise<boolean> {
  if (!user.passwordHash) return false;
  return bcrypt.compare(passwordInput, user.passwordHash);
}
