import { BATCHES, formatBatchForDisplay, getBatchesSortedLatestFirst } from "@/lib/batches";

// --- SINGLE SOURCE OF TRUTH FOR SKILLS ---
export const ALL_SKILLS = [
  "WordPress", 
  "Elementor", 
  "WooCommerce", 
  "React", 
  "Node.js", 
  "SEO Optimization", 
  "UI/UX Design", 
  "Figma",
  "Webflow", 
  "Shopify", 
  "Python",
  "Custom Theme Design",
  "Performance Optimization",
  "Accessibility"
];

export const stats = {
  totalStudents: "1200+",
  batchesCompleted: `${BATCHES.length}+`,
  successRate: "95%",
  placementSuccess: "Proven"
};

// Mock Data Generator (Client-side fallback)
export const generateMockStudents = (count: number = 50) => {
  const batches = getBatchesSortedLatestFirst();
  
  return Array.from({ length: count }, (_, i) => {
    const batchId = batches[i % batches.length].id;
    return {
      id: i + 1,
      name: `Student ${i + 1}`,
      batchId: batchId,
      batch: formatBatchForDisplay(batchId),
      domain: i % 3 === 0 ? "https://moajmalnk.in" : undefined,
      github: i % 2 === 0 ? "https://github.com/student" : undefined,
      email: `student${i + 1}@example.com`,
      phone: i % 4 === 0 ? "+1234567890" : undefined,
      // Use the central list
      skills: ALL_SKILLS.slice(0, Math.floor(Math.random() * 4) + 2),
      isTopPerformer: i < 8
    };
  });
};