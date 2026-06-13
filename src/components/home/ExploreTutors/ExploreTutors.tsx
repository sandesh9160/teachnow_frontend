import Link from "next/link";

const popularSubjects = [
  "Math Teacher Jobs",
  "Physics Lecturer Jobs",
  "Chemistry Teacher Jobs",
  "Biology Teacher Jobs",
  "English Teacher Jobs",
  "Computer Science Teacher Jobs",
  "Economics Teacher Jobs",
  "Commerce Teacher Jobs",
  "Physical Education Teacher Jobs",
  "Primary School Teacher Jobs",
];

const popularLocations = [
  "Teaching Jobs in Hyderabad",
  "Teaching Jobs in Bangalore",
  "Teaching Jobs in Chennai",
  "Teaching Jobs in Delhi",
  "Teaching Jobs in Pune",
  "Teaching Jobs in Mumbai",
  "Teaching Jobs in Kolkata",
  "Teaching Jobs in Ahmedabad",
  "Teaching Jobs in Jaipur",
  "Teaching Jobs in Lucknow",
];

const popularSearches = [
  "Math Teacher Jobs in Hyderabad",
  "Physics Lecturer Jobs in Bangalore",
  "Chemistry Teacher Jobs in Chennai",
  "Biology Teacher Jobs in Delhi",
  "English Teacher Jobs in Pune",
  "Computer Science Teacher Jobs in Mumbai",
  "Economics Teacher Jobs in Kolkata",
  "Commerce Teacher Jobs in Ahmedabad",
  "Principal Jobs in Hyderabad",
  "Vice Principal Jobs in Bangalore",
];

export const ExploreTutors = () => {
  return (
    <section className="pt-8 pb-16 md:pt-10 md:pb-20 bg-white overflow-hidden relative">
      <div className="max-w-none w-full px-4 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-8 px-4">
          <h2 className="text-[32px] md:text-[32px] font-extrabold text-[#1e3a8a] tracking-tight mb-2">
            Explore Teaching Jobs by Location and Subjects
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-500 font-normal">
            Find teaching opportunities across India for Popular Subjects, Roles and Cities
          </p>
        </div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-[1440px] mx-auto">
          
          {/* Card 1: Popular Subjects */}
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white transition-shadow hover:shadow-md">
            <h3 className="text-[18px] font-bold text-[#1e3a8a] mb-5">Popular Subjects</h3>
            <ul className="space-y-3">
              {popularSubjects.map((subject) => (
                <li key={subject} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <Link href={`/jobs?q=${encodeURIComponent(subject.toLowerCase())}`} className="text-[14px] text-slate-600 hover:text-[#1e3a8a] transition-colors leading-relaxed">
                    {subject}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Top Cities */}
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white transition-shadow hover:shadow-md">
            <h3 className="text-[18px] font-bold text-[#1e3a8a] mb-5">Top Cities</h3>
            <ul className="space-y-3">
              {popularLocations.map((location) => (
                <li key={location} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <Link href={`/jobs?location=${encodeURIComponent(location.toLowerCase())}`} className="text-[14px] text-slate-600 hover:text-[#1e3a8a] transition-colors leading-relaxed">
                    {location}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Popular Searches */}
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white transition-shadow hover:shadow-md">
            <h3 className="text-[18px] font-bold text-[#1e3a8a] mb-5">Popular Searches</h3>
            <ul className="space-y-3">
              {popularSearches.map((search) => (
                <li key={search} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <Link href={`/jobs?q=${encodeURIComponent(search.toLowerCase())}`} className="text-[14px] text-slate-600 hover:text-[#1e3a8a] transition-colors leading-relaxed">
                    {search}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ExploreTutors;
