import { roles, cities } from "./topSearches";

export interface TopSearchJob {
  id: string;
  slug: string;
  title: string;
  school: string;
  schoolSlug: string;
  location: string;
  salary: string;
  experience: string;
  type: string;
  posted: string;
  tags: string[];
  description: string;
  responsibilities: string[];
  skills: string[];
  qualification: string;
  teachingLevel: string;
  aboutSchool: string;
  benefits: string[];
}

const schools = [
  { name: "Delhi Public School", slug: "dps", logo: "DPS" },
  { name: "Narayana School", slug: "narayana", logo: "NS" },
  { name: "Sri Chaitanya School", slug: "sri-chaitanya", logo: "SC" },
  { name: "Oakridge International School", slug: "oakridge", logo: "OI" },
  { name: "Kendriya Vidyalaya", slug: "kv", logo: "KV" },
  { name: "Ryan International School", slug: "ryan", logo: "RI" },
  { name: "National Public School", slug: "nps", logo: "NP" },
  { name: "Bishop Cotton School", slug: "bishop-cotton", logo: "BC" },
  { name: "Greenwood High", slug: "greenwood", logo: "GH" },
  { name: "DAV Public School", slug: "dav", logo: "DA" },
  { name: "Podar International", slug: "podar", logo: "PI" },
  { name: "Birla High School", slug: "birla", logo: "BH" },
];

const salaryRanges = [
  "₹30,000 – ₹50,000/month",
  "₹35,000 – ₹60,000/month",
  "₹40,000 – ₹65,000/month",
  "₹45,000 – ₹70,000/month",
  "₹50,000 – ₹80,000/month",
  "₹25,000 – ₹45,000/month",
  "₹55,000 – ₹90,000/month",
];

const expLevels = ["0–2 Years", "1–3 Years", "2–5 Years", "3–6 Years", "5–8 Years", "4–7 Years"];

const postDates = ["2 days ago", "3 days ago", "1 week ago", "5 days ago", "Today", "Yesterday", "4 days ago"];

const jobTypes = ["Full Time", "Part Time", "Contract", "Full Time", "Full Time", "Full Time"];

const boards = ["CBSE", "ICSE", "State Board", "IB", "Cambridge"];

const teachingLevels = ["Secondary School (Class 9–10)", "Senior Secondary (Class 11–12)", "Primary School (Class 1–5)", "Middle School (Class 6–8)", "Junior College", "Coaching Institute"];

const qualifications = [
  "B.Ed + M.Sc in relevant subject",
  "B.Ed + B.Sc with minimum 60%",
  "M.Ed or B.Ed with 2+ years experience",
  "Post-graduation in relevant subject with B.Ed",
  "B.Ed with NET/SET qualification preferred",
  "M.A/M.Sc with B.Ed, TET qualified",
];

const responsibilitySets = [
  [
    "Plan and deliver engaging lessons aligned with the curriculum",
    "Prepare students for board examinations and competitive tests",
    "Conduct regular assessments and provide timely feedback",
    "Maintain classroom discipline and a positive learning environment",
    "Participate in parent-teacher meetings and school events",
    "Collaborate with department members on curriculum planning",
  ],
  [
    "Design and implement lesson plans for assigned classes",
    "Use innovative teaching methods including technology-aided learning",
    "Evaluate student performance through tests, assignments, and projects",
    "Provide individual attention and remedial classes as needed",
    "Maintain accurate records of student progress and attendance",
    "Contribute to extracurricular activities and school functions",
  ],
  [
    "Teach assigned subjects to students following the school syllabus",
    "Create study materials, worksheets, and practice papers",
    "Monitor student progress and communicate with parents regularly",
    "Mentor students for academic and personal growth",
    "Stay updated with the latest teaching methodologies",
    "Organize and supervise laboratory sessions where applicable",
  ],
];

const skillSets = [
  ["Strong subject knowledge", "Classroom management", "Communication skills", "Lesson planning", "Student assessment", "Technology integration"],
  ["Curriculum development", "Critical thinking", "Patience and empathy", "Time management", "Collaborative teaching", "Differentiated instruction"],
  ["Interactive teaching", "Problem-solving", "Leadership skills", "Digital literacy", "Adaptability", "Conflict resolution"],
];

const aboutSchoolTemplates = [
  "is one of India's leading educational institutions with a legacy of academic excellence spanning over 30 years. With state-of-the-art infrastructure, experienced faculty, and a student-centric approach, we nurture future leaders and innovators.",
  "is a premier educational institution committed to holistic development. Our campus features modern classrooms, well-equipped laboratories, a library with over 20,000 books, and sports facilities. We believe in nurturing both academic excellence and character development.",
  "is a progressive school known for its innovative teaching methods and inclusive environment. We focus on experiential learning, critical thinking, and preparing students for the challenges of the 21st century.",
  "has been at the forefront of quality education for decades. With affiliations to national and international boards, we provide a global perspective while staying rooted in Indian values. Our alumni network spans across the world.",
];

const benefitSets = [
  ["Competitive salary with annual increments", "Provident fund and gratuity", "Medical insurance for self and family", "Professional development opportunities", "Summer and winter vacations", "Transport facility"],
  ["Performance-based bonuses", "Free meals during school hours", "Children's education fee waiver", "Annual health check-ups", "Leave encashment policy", "Retirement benefits"],
  ["Subsidized housing or HRA", "Access to school library and resources", "Skill development workshops", "Collaborative work culture", "Festival bonuses", "Career advancement pathways"],
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], hash: number, offset: number): T {
  return arr[(hash + offset) % arr.length];
}

export function getJobsForSlug(slug: string): { role: string; city: string; jobs: TopSearchJob[] } | null {
  // Try to match [city]-[role]-jobs
  const match = slug.match(/^([^-]+)-(.+)-jobs$/);
  if (!match) return null;

  const citySlug = match[1];
  const roleSlug = match[2];

  const role = roles.find((r) => r.slug === roleSlug);
  const city = cities.find((c) => c.toLowerCase() === citySlug);

  if (!role || !city) return null;

  const h = hashCode(`${roleSlug}-${citySlug}`);
  const count = 6 + (h % 3);

  const jobs: TopSearchJob[] = [];
  for (let i = 0; i < count; i++) {
    const school = pick(schools, h, i * 3);
    const jobSlug = `${city.toLowerCase()}-${roleSlug}-${school.slug}`;
    jobs.push({
      id: `${roleSlug}-${citySlug}-${i}`,
      slug: jobSlug,
      title: role.label,
      school: school.name,
      schoolSlug: school.slug,
      location: city,
      salary: pick(salaryRanges, h, i * 7),
      experience: pick(expLevels, h, i * 5),
      type: pick(jobTypes, h, i * 2),
      posted: pick(postDates, h, i * 4),
      tags: [role.label.split(" ")[0], city, pick(boards, h, i)],
      description: `We are looking for a passionate and experienced ${role.label} to join ${school.name} in ${city}. The ideal candidate will have a strong command over the subject, excellent communication skills, and a genuine passion for teaching and mentoring students.`,
      responsibilities: pick(responsibilitySets, h, i),
      skills: pick(skillSets, h, i + 1),
      qualification: pick(qualifications, h, i * 3),
      teachingLevel: pick(teachingLevels, h, i * 2),
      aboutSchool: `${school.name} ${pick(aboutSchoolTemplates, h, i)}`,
      benefits: pick(benefitSets, h, i),
    });
  }

  return { role: role.label, city, jobs };
}

export function getJobBySlug(jobSlug: string): { job: TopSearchJob; role: string; city: string; relatedJobs: TopSearchJob[] } | null {
  // Try all role+city combinations to find the job
  for (const role of roles) {
    for (const city of cities) {
      const listingSlug = `${city.toLowerCase()}-${role.slug}-jobs`;
      const data = getJobsForSlug(listingSlug);
      if (!data) continue;
      const job = data.jobs.find((j) => j.slug === jobSlug);
      if (job) {
        const relatedJobs = data.jobs.filter((j) => j.slug !== jobSlug).slice(0, 3);
        return { job, role: data.role, city: data.city, relatedJobs };
      }
    }
  }
  return null;
}

// Export school logos map for UI
export const schoolLogos: Record<string, string> = {};
schools.forEach((s) => {
  schoolLogos[s.name] = s.logo;
});
