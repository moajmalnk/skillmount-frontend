import { Material } from "@/types/material";

const STORAGE_KEY = "skillmount_materials";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MOCK_MATERIALS: Material[] = [
  // --- VIDEOS (6 Items) ---
  {
    id: "VID-001",
    title: "Elementor Pro Complete Tutorial",
    type: "Video",
    category: "Elementor",
    url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Master Elementor Pro from basics to advanced features. Learn to create stunning landing pages, headers, footers, and dynamic content.",
    duration: "2h 45m",
    topics: ["Page Builder", "Templates", "Widgets"],
    lastUpdated: "2025-10-01"
  },
  {
    id: "VID-002",
    title: "WooCommerce Complete Setup",
    type: "Video",
    category: "E-commerce",
    url: "https://youtube.com/watch?v=example",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Complete guide to setting up an online store. Payment gateways, shipping, and tax configuration.",
    duration: "3h 15m",
    topics: ["E-commerce", "Products", "Checkout"],
    lastUpdated: "2025-10-05"
  },
  {
    id: "VID-003",
    title: "WordPress Theme Customization",
    type: "Video",
    category: "WordPress",
    url: "https://youtube.com/watch?v=example",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Learn to customize themes using the Customizer, child themes, and custom CSS.",
    duration: "1h 50m",
    topics: ["Themes", "Customization", "CSS"],
    lastUpdated: "2025-09-20"
  },
  {
    id: "VID-004",
    title: "Performance Optimization Guide",
    type: "Video",
    category: "Performance",
    url: "https://youtube.com/watch?v=example",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Speed up your WordPress site with caching, image optimization, and CDN setup.",
    duration: "1h 30m",
    topics: ["Caching", "Speed", "Optimization"],
    lastUpdated: "2025-09-25"
  },
  {
    id: "VID-005",
    title: "Advanced Elementor Animations",
    type: "Video",
    category: "Elementor",
    url: "https://youtube.com/watch?v=example",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Create stunning animations and effects. Learn motion effects and interactive elements.",
    duration: "45m",
    topics: ["Motion Effects", "Lottie", "Interactivity"],
    lastUpdated: "2025-10-10"
  },
  {
    id: "VID-006",
    title: "WordPress SEO with Yoast",
    type: "Video",
    category: "SEO",
    url: "https://youtube.com/watch?v=example",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Master WordPress SEO. Keyword optimization, meta descriptions, and sitemaps.",
    duration: "1h 15m",
    topics: ["SEO", "Yoast", "Ranking"],
    lastUpdated: "2025-10-12"
  },

  // --- THEMES (5 Items) ---
  {
    id: "THM-001",
    title: "Astra Pro - Multi-Purpose",
    type: "Theme",
    category: "WordPress",
    url: "#",
    description: "Lightweight, fast-loading theme perfect for any website.",
    size: "8.5 MB",
    version: "4.6.0",
    features: ["Elementor Ready", "WooCommerce", "Fast Loading"],
    lastUpdated: "2025-09-15"
  },
  {
    id: "THM-002",
    title: "OceanWP - E-commerce Package",
    type: "Theme",
    category: "E-commerce",
    url: "#",
    description: "Complete e-commerce solution with WooCommerce integration.",
    size: "12.3 MB",
    version: "3.5.2",
    features: ["WooCommerce", "Mobile First", "SEO Ready"],
    lastUpdated: "2025-09-10"
  },
  {
    id: "THM-003",
    title: "Elementor Landing Page Pack",
    type: "Theme",
    category: "Templates",
    url: "#",
    description: "50+ professional landing page templates for various industries.",
    size: "15.7 MB",
    version: "2.3.0",
    features: ["50+ Templates", "Conversion Ready"],
    lastUpdated: "2025-10-01"
  },
  {
    id: "THM-004",
    title: "Corporate Business Bundle",
    type: "Theme",
    category: "Business",
    url: "#",
    description: "Professional business theme with multiple homepage layouts.",
    size: "18.2 MB",
    version: "1.8.5",
    features: ["Portfolio", "Contact Forms", "Team Section"],
    lastUpdated: "2025-08-20"
  },
  {
    id: "THM-005",
    title: "Hello Elementor Starter",
    type: "Theme",
    category: "Starter",
    url: "#",
    description: "The lightest theme for Elementor. Perfect canvas for building from scratch.",
    size: "1.2 MB",
    version: "3.0.1",
    features: ["Lightweight", "Developer Friendly", "Blank Canvas"],
    lastUpdated: "2025-10-15"
  },

  // --- PLUGINS (6 Items) ---
  {
    id: "PLG-001",
    title: "Yoast SEO Config Guide",
    type: "Plugin",
    category: "SEO",
    url: "#",
    description: "Comprehensive PDF guide covering all Yoast SEO settings and schema markup.",
    size: "4.2 MB",
    pages: 45,
    lastUpdated: "2025-09-01"
  },
  {
    id: "PLG-002",
    title: "WP Rocket Manual",
    type: "Plugin",
    category: "Performance",
    url: "#",
    description: "Step-by-step manual for configuring WP Rocket caching.",
    size: "3.8 MB",
    pages: 38,
    lastUpdated: "2025-10-05"
  },
  {
    id: "PLG-003",
    title: "Wordfence Security Setup",
    type: "Plugin",
    category: "Security",
    url: "#",
    description: "Security hardening guide. Firewall configuration and malware scanning.",
    size: "5.1 MB",
    pages: 52,
    lastUpdated: "2025-08-15"
  },
  {
    id: "PLG-004",
    title: "Contact Form 7 Checklist",
    type: "Plugin",
    category: "Forms",
    url: "#",
    description: "Quick reference for creating effective forms with spam protection.",
    size: "1.9 MB",
    pages: 12,
    lastUpdated: "2025-09-22"
  },
  {
    id: "PLG-005",
    title: "WooCommerce Payment Setup",
    type: "Plugin",
    category: "E-commerce",
    url: "#",
    description: "Guide for integrating Stripe, PayPal, and local payment methods.",
    size: "6.3 MB",
    pages: 58,
    lastUpdated: "2025-10-15"
  },
  {
    id: "PLG-006",
    title: "UpdraftPlus Backup Strategy",
    type: "Plugin",
    category: "Maintenance",
    url: "#",
    description: "Complete guide to scheduled backups and cloud storage.",
    size: "3.5 MB",
    pages: 32,
    lastUpdated: "2025-09-10"
  },

  // --- ASSETS (6 Items) ---
  {
    id: "AST-001",
    title: "Product Photography Pack",
    type: "Asset",
    category: "Images",
    url: "#",
    description: "High-quality product images for WooCommerce stores. 50+ images.",
    size: "125 MB",
    fileCount: 50,
    formats: ["JPG", "PNG"],
    lastUpdated: "2025-07-15"
  },
  {
    id: "AST-002",
    title: "Service Business Content",
    type: "Asset",
    category: "Content",
    url: "#",
    description: "Pre-written content for About, Services, and FAQ pages.",
    size: "500 KB",
    fileCount: 8,
    formats: ["DOCX", "TXT"],
    lastUpdated: "2025-08-01"
  },
  {
    id: "AST-003",
    title: "500+ SVG Icons Library",
    type: "Asset",
    category: "Icons",
    url: "#",
    description: "Comprehensive icon library for business and UI elements.",
    size: "8.5 MB",
    fileCount: 500,
    formats: ["SVG", "PNG"],
    lastUpdated: "2025-09-30"
  },
  {
    id: "AST-004",
    title: "Hero Images Collection",
    type: "Asset",
    category: "Images",
    url: "#",
    description: "Professional high-res hero images for landing pages.",
    size: "245 MB",
    fileCount: 30,
    formats: ["JPG", "WEBP"],
    lastUpdated: "2025-10-02"
  },
  {
    id: "AST-005",
    title: "Logo Design Templates",
    type: "Asset",
    category: "Design",
    url: "#",
    description: "Editable logo templates in Photoshop and Illustrator formats.",
    size: "95 MB",
    fileCount: 20,
    formats: ["PSD", "AI"],
    lastUpdated: "2025-06-20"
  },
  {
    id: "AST-006",
    title: "Sample Blog Posts",
    type: "Asset",
    category: "Content",
    url: "#",
    description: "20 sample blog posts covering web design topics.",
    size: "750 KB",
    fileCount: 20,
    formats: ["DOCX", "HTML"],
    lastUpdated: "2025-08-12"
  },

  // --- SNIPPETS (6 Items) ---
  {
    id: "SNP-001",
    title: "Custom Login Page Styling",
    type: "Snippet",
    category: "WordPress Core",
    url: "#",
    description: "CSS to customize WordPress login page with brand colors.",
    language: "CSS",
    code: `/* Custom Login Page Styles */\n.login h1 a {\n  background-image: url('logo.png');\n  width: 100%;\n}\nbody.login {\n  background: #f1f1f1;\n}`,
    lastUpdated: "2025-05-10"
  },
  {
    id: "SNP-002",
    title: "Remove WP Version",
    type: "Snippet",
    category: "Security",
    url: "#",
    description: "PHP snippet to hide WordPress version for security.",
    language: "PHP",
    code: `function remove_wp_version() {\n  return '';\n}\nadd_filter('the_generator', 'remove_wp_version');`,
    lastUpdated: "2025-05-12"
  },
  {
    id: "SNP-003",
    title: "WooCommerce Custom Button",
    type: "Snippet",
    category: "WooCommerce",
    url: "#",
    description: "Change 'Add to Cart' text based on product type.",
    language: "PHP",
    code: `add_filter('woocommerce_product_add_to_cart_text', 'custom_text');\nfunction custom_text() {\n  return __('Buy Now', 'woocommerce');\n}`,
    lastUpdated: "2025-06-01"
  },
  {
    id: "SNP-004",
    title: "Elementor Hover Effects",
    type: "Snippet",
    category: "Elementor",
    url: "#",
    description: "CSS animations for Elementor widgets.",
    language: "CSS",
    code: `.elementor-widget:hover {\n  transform: translateY(-5px);\n  transition: 0.3s ease;\n}`,
    lastUpdated: "2025-07-20"
  },
  {
    id: "SNP-005",
    title: "Disable Admin Bar",
    type: "Snippet",
    category: "WordPress Core",
    url: "#",
    description: "Hide admin bar for non-admin users.",
    language: "PHP",
    code: `add_action('after_setup_theme', 'remove_admin_bar');\nfunction remove_admin_bar() {\n  if (!current_user_can('administrator') && !is_admin()) {\n    show_admin_bar(false);\n  }\n}`,
    lastUpdated: "2025-08-05"
  },
  {
    id: "SNP-006",
    title: "Register Portfolio Post Type",
    type: "Snippet",
    category: "WordPress Core",
    url: "#",
    description: "Create a custom post type for portfolios.",
    language: "PHP",
    code: `function create_portfolio_cpt() {\n  register_post_type('portfolio', array(\n    'public' => true,\n    'label' => 'Portfolio'\n  ));\n}\nadd_action('init', 'create_portfolio_cpt');`,
    lastUpdated: "2025-08-10"
  }
];

export const materialService = {
  // GET ALL
  getAll: async (): Promise<Material[]> => {
    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    // Initial Load
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_MATERIALS));
    return MOCK_MATERIALS;
  },

  // CREATE
  create: async (material: Omit<Material, "id" | "lastUpdated">): Promise<Material> => {
    await delay(800);
    const current = await materialService.getAll();
    
    const newMaterial: Material = {
      ...material,
      id: `MAT-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    const updated = [newMaterial, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newMaterial;
  },

  // DELETE
  delete: async (id: string): Promise<void> => {
    await delay(500);
    const current = await materialService.getAll();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};