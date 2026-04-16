"use client";

const steps = [
  {
    step: 1,
    title: "Create Employer Account",
    desc: "Register as an employer to start posting teaching vacancies.",
    img: "/images/steps/step1-signup.png",
  },
  {
    step: 2,
    title: "Post Teaching Job",
    desc: "Add job details including subject, experience, salary, and location.",
    img: "/images/steps/step2-post-job.png",
  },
  {
    step: 3,
    title: "Receive Applications",
    desc: "Teachers apply to your job listings instantly.",
    img: "/images/steps/step3-receive-apps.png",
  },
  {
    step: 4,
    title: "Hire the Best Teacher",
    desc: "Review applicants and hire qualified educators quickly.",
    img: "/images/steps/step4-hire.png",
  },
];

export const EmployerSteps = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Hire the Best <span className="text-primary/80">Teachers</span>
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Simplify your recruitment process and find qualified educators
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group relative rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full -mr-12 -mt-12 pointer-events-none z-0" />
              
              <div className="relative z-10 mx-auto mb-4 h-32 w-32 overflow-hidden rounded-xl">
                <img
                  src={s.img}
                  alt={s.title}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className={`relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold mb-3 ${
                s.step === 1 ? "bg-blue-50 text-blue-600" :
                s.step === 2 ? "bg-emerald-50 text-emerald-600" :
                s.step === 3 ? "bg-rose-50 text-rose-600" :
                "bg-amber-50 text-amber-600"
              }`}>
                {s.step}
              </div>
              <h3 className="relative z-10 font-display text-base font-bold text-slate-900 leading-tight">{s.title}</h3>
              <p className="relative z-10 mt-2 text-sm text-slate-500 font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmployerSteps;
