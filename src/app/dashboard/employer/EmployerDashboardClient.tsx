"use client";

import { 
  Users, 
  Briefcase, 
  FileCheck, 
  TrendingUp,
  PlusCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";

export default function EmployerDashboardClient({ welcomeName }: { welcomeName: string }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">Employer Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome, {welcomeName || "Member"}. Manage your postings and track candidates.</p>
        </div>
        
        <Link href="/dashboard/employer/post-job">
          <Button variant="default" size="lg" className="shadow-lg shadow-primary/20">
            <PlusCircle className="w-5 h-5 mr-2" />
            Post a New Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Active Jobs", value: "0", icon: Briefcase, color: "blue" },
          { label: "Total Applicants", value: "0", icon: Users, color: "indigo" },
          { label: "Verified Inst.", value: "0", icon: FileCheck, color: "emerald" },
          { label: "Account Status", value: "Active", icon: TrendingUp, color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl w-fit mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Job Postings</h3>
        <p className="text-gray-500 max-w-sm mb-8">Start your recruitment journey by posting your first job opening to reach thousands of teachers.</p>
        <Link href="/dashboard/employer/post-job">
          <Button variant="outline" size="lg">Create First Posting</Button>
        </Link>
      </div>
    </div>
  );
}
