import React from "react";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Upload, Users, FileText } from "lucide-react";
import { useResource } from "../context/ResourceContext";

const StatCard = ({ icon: Icon, title, value }) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-emerald-100 dark:border-zinc-800 shadow-sm">
    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
      <Icon size={24} />
    </div>
    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
      {title}
    </p>
    <h3 className="text-2xl font-bold dark:text-white mt-1">{value}</h3>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { books } = useResource();
  console.log("books data ", books);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">
          Welcome, {user?.firstName}
        </h1>
        <p className="text-zinc-500 capitalize">Role: {user?.role}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} title="Resources available" value="1,240" />
        {user?.role === "admin" && (
          <StatCard icon={Users} title="Total Users" value="850" />
        )}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <StatCard icon={Upload} title="My Uploads" value="12" />
        )}
        <StatCard icon={FileText} title="Recent Activity" value="24" />
      </div>
    </div>
  );
}
