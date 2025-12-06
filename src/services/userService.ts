import { Student, UserRole, User } from "@/types/user";
import { BATCHES, getBatchesSortedLatestFirst } from "@/lib/batches";
import { ALL_SKILLS } from "@/lib/students-data";

const STORAGE_KEY = "skillmount_users";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Helper Lists for Random Generation
const FIRST_NAMES = ["Aarav", "Zara", "Ishaan", "Mira", "Vihaan", "Ananya", "Aditya", "Sana", "Kabir", "Riya", "Arjun", "Fatima", "Rohan", "Aisha", "Karthik"];
const LAST_NAMES = ["Sharma", "Khan", "Patel", "Nair", "Menon", "Verma", "Reddy", "Iyer", "Gupta", "Malik", "Singh", "Das"];
const LOCATIONS = ["Kerala, India", "Bangalore, India", "Dubai, UAE", "Mumbai, India", "Chennai, India", "Remote"];

// Generate 50+ Mock Students
const generateMockStudents = (): Student[] => {
  const batches = getBatchesSortedLatestFirst();
  
  return Array.from({ length: 60 }, (_, i) => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const batch = batches[i % batches.length];
    const isPlaced = Math.random() > 0.7;
    
    const studentSkills = [];
    const skillCount = Math.floor(Math.random() * 3) + 3;
    for(let j=0; j<skillCount; j++) {
        const randomSkill = ALL_SKILLS[Math.floor(Math.random() * ALL_SKILLS.length)];
        if(!studentSkills.includes(randomSkill)) {
            studentSkills.push(randomSkill);
        }
    }
  
    return {
      id: `STU-${1000 + i}`,
      regId: `SM-${2024000 + i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: "student",
      status: "Active",
      batch: batch.id,
      mentor: "Dr. Alan Grant",
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      isProfileComplete: true,
      
      headline: `${isPlaced ? "Frontend Developer" : "Aspiring Web Developer"} | ${batch.displayName} Student`,
      bio: `Passionate developer trained in modern web technologies. I love building accessible and performant websites.`,
      
      skills: studentSkills,
      projects: [], 
      
      isTopPerformer: Math.random() > 0.9, 
      isFeatured: Math.random() > 0.85,
      
      placement: isPlaced ? {
        company: ["TechCorp", "Creative Agency", "WebSolutions", "Google", "Amazon"][Math.floor(Math.random() * 5)],
        role: "Junior Developer",
        package: `${Math.floor(Math.random() * 4) + 3} LPA`
      } : undefined,

      socials: {
        github: `https://github.com/${firstName.toLowerCase()}`,
        website: Math.random() > 0.5 ? `https://${firstName.toLowerCase()}.dev` : undefined,
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}`
      }
    };
  });
};

// Static Admin & Specific Test Users
const MOCK_OTHERS: User[] = [
  // 1. SUPER ADMIN
  {
    id: "ADMIN-001",
    name: "Super Admin",
    email: "admin@skillmount.com",
    role: "super_admin",
    status: "Active",
    createdAt: "2024-01-01",
    isProfileComplete: true
  },
  // 2. ACTIVE TUTOR
  {
    id: "TUT-001",
    name: "Dr. Alan Grant",
    email: "tutor@skillmount.com",
    role: "tutor",
    status: "Active",
    createdAt: "2024-01-01",
    isProfileComplete: true,
    topics: ["WordPress", "React"]
  },
  // 3. INCOMPLETE STUDENT (For Onboarding Test)
  {
    id: "STU-NEW",
    regId: "SM-PENDING-01",
    name: "Sarah (Incomplete)",
    email: "new@skillmount.com", // Matches auth.ts mock
    role: "student",
    status: "Pending",
    batch: "0925",
    createdAt: new Date().toISOString(),
    isProfileComplete: false, // <--- Key for testing
    skills: [],
    projects: []
  },
  // 4. INCOMPLETE TUTOR (For Onboarding Test)
  {
    id: "TUT-NEW",
    name: "Prof. Newbie",
    email: "newtutor@skillmount.com", // Matches auth.ts mock
    role: "tutor",
    status: "Pending",
    createdAt: new Date().toISOString(),
    isProfileComplete: false, // <--- Key for testing
    topics: []
  },
  // 5. INCOMPLETE AFFILIATE (For Onboarding Test)
  {
    id: "AFF-NEW",
    name: "Partner Pending",
    email: "newaffiliate@skillmount.com", // Matches auth.ts mock
    role: "affiliate",
    status: "Pending",
    createdAt: new Date().toISOString(),
    isProfileComplete: false, // <--- Key for testing
    couponCode: "PENDING",
    platform: "Instagram"
  },
  // 6. ACTIVE AFFILIATE
  {
    id: "AFF-001",
    name: "Marketing Pro",
    email: "affiliate@skillmount.com",
    role: "affiliate",
    status: "Active",
    createdAt: "2024-01-01",
    isProfileComplete: true,
    couponCode: "PRO20",
    platform: "YouTube",
    earnings: 450
  }
];

export const userService = {
  getAll: async (): Promise<User[]> => {
    await delay(800); 
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    const generatedStudents = generateMockStudents();
    // Combine static test users with generated ones
    const allUsers = [...MOCK_OTHERS, ...generatedStudents];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
    return allUsers;
  },

  getById: async (id: string): Promise<User | undefined> => {
    const users = await userService.getAll();
    return users.find(u => u.id === id);
  },

  getElementsByRole: async (role: UserRole) => {
    const allUsers = await userService.getAll();
    return allUsers.filter((u) => u.role === role);
  },

  create: async (user: any): Promise<void> => {
    await delay(600);
    const allUsers = await userService.getAll();
    const newUser = {
      ...user,
      id: user.id || `USR-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newUser, ...allUsers];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  update: async (id: string, data: any): Promise<void> => {
    await delay(400);
    const allUsers = await userService.getAll();
    const updated = allUsers.map((u) => (u.id === id ? { ...u, ...data } : u));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    const allUsers = await userService.getAll();
    const updated = allUsers.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
};