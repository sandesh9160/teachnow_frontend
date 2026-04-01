const roles = [
  { label: "Math Teacher", slug: "math-teacher" },
  { label: "Physics Lecturer", slug: "physics-lecturer" },
  { label: "Chemistry Teacher", slug: "chemistry-teacher" },
  { label: "Biology Teacher", slug: "biology-teacher" },
  { label: "English Teacher", slug: "english-teacher" },
  { label: "Computer Science Teacher", slug: "computer-science-teacher" },
  { label: "Economics Teacher", slug: "economics-teacher" },
  { label: "Commerce Teacher", slug: "commerce-teacher" },
];

const cities = [
  "Hyderabad",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

export interface TopSearchLink {
  title: string;
  slug: string;
}

const topSearchLinks: TopSearchLink[] = [];

for (const role of roles) {
  for (const city of cities) {
    topSearchLinks.push({
      title: `${role.label} Jobs in ${city}`,
      slug: `/${city.toLowerCase()}-${role.slug}-jobs`,
    });
  }
}

export const footerTopSearches: TopSearchLink[] = [
  { title: "Math Teacher Jobs in Hyderabad", slug: "/hyderabad-math-teacher-jobs" },
  { title: "Math Teacher Jobs in Delhi", slug: "/delhi-math-teacher-jobs" },
  { title: "Math Teacher Jobs in Mumbai", slug: "/mumbai-math-teacher-jobs" },
  { title: "Physics Lecturer Jobs in Bangalore", slug: "/bangalore-physics-lecturer-jobs" },
  { title: "Chemistry Teacher Jobs in Chennai", slug: "/chennai-chemistry-teacher-jobs" },
  { title: "English Teacher Jobs in Kolkata", slug: "/kolkata-english-teacher-jobs" },
];

export { roles, cities };
export default topSearchLinks;
