import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const CATEGORIES = [
  "Programming",
  "Music",
  "Languages",
  "Art & Design",
  "Cooking",
  "Fitness",
  "Photography",
  "Writing",
  "Math & Science",
  "Business",
  "Other",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const FORMATS = ["In-Person", "Video", "Async"];
const SESSION_STATUSES = [
  "Pending",
  "Accepted",
  "Declined",
  "Cancelled",
  "Completed",
];

// ── Name/word pools for realistic data ───────
const FIRST_NAMES = [
  "Alex",
  "Sofia",
  "Raj",
  "Mia",
  "Jamal",
  "Lena",
  "Carlos",
  "Priya",
  "Omar",
  "Yuki",
  "Ava",
  "Noah",
  "Fatima",
  "Leo",
  "Zara",
  "Ethan",
  "Nina",
  "Amir",
  "Chloe",
  "Kai",
  "Maya",
  "Dante",
  "Isla",
  "Rohan",
  "Luna",
  "Felix",
  "Sara",
  "Mateo",
  "Aria",
  "Idris",
  "Nora",
  "Ravi",
  "Elena",
  "Hassan",
  "Lily",
  "Theo",
  "Amara",
  "Vijay",
  "Hana",
  "Marco",
  "Sage",
  "Dev",
  "Iris",
  "Joaquin",
  "Tara",
  "Aiden",
  "Mei",
  "Soren",
  "Jia",
  "Kian",
];

const LAST_NAMES = [
  "Chen",
  "Martinez",
  "Patel",
  "Thompson",
  "Williams",
  "Kim",
  "Garcia",
  "Singh",
  "Johnson",
  "Tanaka",
  "Brown",
  "Ali",
  "Davis",
  "Nguyen",
  "Lee",
  "Wilson",
  "Ahmed",
  "Moore",
  "Taylor",
  "Sharma",
  "Anderson",
  "Lopez",
  "Clark",
  "Nakamura",
  "Rivera",
  "Hall",
  "Adams",
  "Baker",
  "Hill",
  "Scott",
  "Green",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Torres",
  "Diaz",
  "Fisher",
  "Cruz",
  "Reed",
];

const SKILL_TITLES = {
  Programming: [
    "Python Fundamentals",
    "JavaScript ES6+",
    "React Development",
    "Node.js Backend",
    "Data Structures & Algorithms",
    "Machine Learning Basics",
    "SQL & Databases",
    "CSS & Responsive Design",
    "TypeScript Essentials",
    "Git & Version Control",
    "REST API Design",
    "Docker & Containers",
    "Vue.js Basics",
    "C++ Programming",
    "Mobile App Development",
  ],
  Music: [
    "Jazz Guitar",
    "Piano for Beginners",
    "Music Theory",
    "Vocal Training",
    "Drum Basics",
    "Songwriting",
    "Music Production",
    "Classical Violin",
    "Bass Guitar",
    "Ukulele Basics",
  ],
  Languages: [
    "Conversational Spanish",
    "Mandarin Chinese",
    "French Basics",
    "Japanese Language",
    "Hindi Conversation",
    "Korean for Beginners",
    "Arabic Fundamentals",
    "German Essentials",
    "Portuguese Basics",
    "Sign Language",
  ],
  "Art & Design": [
    "Watercolor Painting",
    "Digital Illustration",
    "UI/UX Design",
    "Graphic Design Basics",
    "Calligraphy",
    "Pottery & Ceramics",
    "Sketching & Drawing",
    "3D Modeling",
  ],
  Cooking: [
    "Italian Home Cooking",
    "Thai Cuisine",
    "Baking & Pastry",
    "Sushi Making",
    "Indian Curry Masterclass",
    "Vegan Meal Prep",
    "BBQ & Grilling",
    "French Pastry",
  ],
  Fitness: [
    "Yoga Fundamentals",
    "Weight Training",
    "Running Coaching",
    "Martial Arts Basics",
    "Dance Fitness",
    "Meditation & Mindfulness",
    "Swimming Technique",
    "Calisthenics",
  ],
  Photography: [
    "Portrait Photography",
    "Landscape Photography",
    "Photo Editing (Lightroom)",
    "Street Photography",
    "Macro Photography",
    "Night Photography",
    "Drone Photography",
  ],
  Writing: [
    "Creative Writing",
    "Technical Writing",
    "Blog Writing",
    "Poetry Workshop",
    "Screenwriting Basics",
    "Academic Writing",
    "Copywriting",
  ],
  "Math & Science": [
    "Calculus Tutoring",
    "Statistics & Probability",
    "Physics Fundamentals",
    "Chemistry Basics",
    "Linear Algebra",
    "Biology Concepts",
  ],
  Business: [
    "Public Speaking",
    "Financial Literacy",
    "Entrepreneurship 101",
    "Marketing Strategy",
    "Project Management",
    "Negotiation Skills",
  ],
  Other: [
    "Chess Strategy",
    "Gardening Basics",
    "Home Repair",
    "Car Maintenance",
    "Knitting & Crochet",
    "Board Game Design",
  ],
};

const BIOS = [
  "Lifelong learner always looking to pick up new skills.",
  "Passionate about teaching and sharing knowledge.",
  "Grad student looking to trade skills with peers.",
  "Creative professional exploring new hobbies.",
  "Tech enthusiast who loves learning from others.",
  "Firm believer in learning by doing and teaching.",
  "Curious mind with a knack for picking things up fast.",
  "Love connecting with people over shared interests.",
  "Career changer exploring new fields through skill swaps.",
  "Community-minded and always down to help out.",
];

const AVAILABILITIES = [
  "Weekday evenings",
  "Weekends",
  "Flexible",
  "Mon/Wed/Fri afternoons",
  "Tuesday & Thursday evenings",
  "Morning slots daily",
  "Saturday mornings",
  "Sunday afternoons",
  "After 5pm weekdays",
  "Anytime — very flexible",
];

const FEEDBACK_COMMENTS = [
  "Great session! Learned a lot.",
  "Very patient and knowledgeable teacher.",
  "Excellent explanations, would swap again.",
  "Clear and well-structured lesson.",
  "Really enjoyed the hands-on approach.",
  "Friendly and encouraging. Highly recommend!",
  "Covered a lot of material in a short time.",
  "Perfect pace for my skill level.",
  "Very organized and prepared.",
  "Fun and engaging teaching style.",
  "Helped me understand concepts I struggled with.",
  "Practical examples made everything click.",
  "Would definitely book another session.",
  "Thorough and detailed feedback provided.",
  "Made a complex topic feel approachable.",
];

// ── Helpers ──────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(1));
const randDate = (startDaysAgo, endDaysAgo) => {
  const now = Date.now();
  const start = now - startDaysAgo * 86400000;
  const end = now - endDaysAgo * 86400000;
  return new Date(start + Math.random() * (end - start));
};

const seed = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    console.log(`Connected to: ${db.databaseName}`);

    // Clear existing data
    console.log("Clearing existing data...");
    await db.collection("users").deleteMany({});
    await db.collection("skills").deleteMany({});
    await db.collection("sessions").deleteMany({});

    // ── Create Users (100) ─────────────────
    console.log("Creating 100 users...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const usedEmails = new Set();
    const users = [];

    for (let i = 0; i < 100; i++) {
      let firstName, lastName, email;
      do {
        firstName = pick(FIRST_NAMES);
        lastName = pick(LAST_NAMES);
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 999)}@example.com`;
      } while (usedEmails.has(email));
      usedEmails.add(email);

      users.push({
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        bio: pick(BIOS),
        hoursTeaught: randInt(0, 50),
        hoursReceived: randInt(0, 50),
        overallRating: randFloat(3.0, 5.0),
        totalRatings: randInt(0, 25),
        createdAt: randDate(90, 0),
        updatedAt: new Date(),
      });
    }

    const userResult = await db.collection("users").insertMany(users);
    const userIds = Object.values(userResult.insertedIds);
    console.log(`  Inserted ${userIds.length} users`);

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    // ── Create Skills (500) ────────────────
    console.log("Creating 500 skills...");
    const skills = [];
    const usedSkillKeys = new Set();

    for (let i = 0; i < 500; i++) {
      let userId, category, title, key;

      // Ensure no duplicate user+title combos
      do {
        userId = pick(userIds);
        category = pick(CATEGORIES);
        title = pick(SKILL_TITLES[category]);
        key = `${userId.toString()}-${title}`;
      } while (usedSkillKeys.has(key));
      usedSkillKeys.add(key);

      skills.push({
        userId,
        title,
        description: `Learn ${title.toLowerCase()} from an experienced practitioner. ${pick(["Hands-on approach.", "Theory and practice combined.", "Project-based learning.", "Tailored to your level.", "Step-by-step guidance."])}`,
        category,
        experienceLevel: pick(LEVELS),
        availability: pick(AVAILABILITIES),
        format: pick(FORMATS),
        createdAt: randDate(90, 0),
        updatedAt: new Date(),
      });
    }

    const skillResult = await db.collection("skills").insertMany(skills);
    const skillIds = Object.values(skillResult.insertedIds);
    console.log(`  Inserted ${skillIds.length} skills`);

    await db
      .collection("skills")
      .createIndex({ userId: 1, title: 1 }, { unique: true });

    // ── Create Sessions (500) ──────────────
    console.log("Creating 500 sessions...");
    const sessions = [];

    for (let i = 0; i < 500; i++) {
      let requesterId, responderId;

      // Ensure requester !== responder
      do {
        requesterId = pick(userIds);
        responderId = pick(userIds);
      } while (requesterId.toString() === responderId.toString());

      const status = pick(SESSION_STATUSES);
      const duration = pick([0.5, 1, 1.5, 2, 2.5, 3]);

      const sessionDoc = {
        requesterId,
        responderId,
        skillRequestedId: pick(skillIds),
        skillOfferedId: pick(skillIds),
        scheduledDate: randDate(60, -30), // past 60 days to 30 days in future
        duration,
        format: pick(FORMATS),
        status,
        feedback: {},
        createdAt: randDate(90, 0),
        updatedAt: new Date(),
      };

      // Add feedback for completed sessions
      if (status === "Completed") {
        const addRequesterFeedback = Math.random() > 0.2;
        const addResponderFeedback = Math.random() > 0.2;

        if (addRequesterFeedback) {
          sessionDoc.feedback.requesterFeedback = {
            rating: randInt(3, 5),
            comment: pick(FEEDBACK_COMMENTS),
          };
        }
        if (addResponderFeedback) {
          sessionDoc.feedback.responderFeedback = {
            rating: randInt(3, 5),
            comment: pick(FEEDBACK_COMMENTS),
          };
        }
      }

      sessions.push(sessionDoc);
    }

    const sessionResult = await db
      .collection("sessions")
      .insertMany(sessions);
    console.log(
      `  Inserted ${Object.keys(sessionResult.insertedIds).length} sessions`,
    );

    await db.collection("sessions").createIndex({ requesterId: 1 });
    await db.collection("sessions").createIndex({ responderId: 1 });

    // ── Summary ────────────────────────────
    const totalRecords = userIds.length + skillIds.length + 500;
    console.log("\n========================================");
    console.log("  Seed Complete!");
    console.log("========================================");
    console.log(`  Users:    ${userIds.length}`);
    console.log(`  Skills:   ${skillIds.length}`);
    console.log(`  Sessions: 500`);
    console.log(`  TOTAL:    ${totalRecords} records`);
    console.log("========================================");
    console.log("\n  All test users password: password123");
    console.log(
      `  Example login: ${users[0].email} / password123`,
    );
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
};

seed();
