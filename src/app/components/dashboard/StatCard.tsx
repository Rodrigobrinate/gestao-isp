// app/components/dashboard/StatCard.tsx
'use client';
import { Icon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

export function StatCard({ title, value, icon: Icon }: Props) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex items-center gap-4">
      <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}