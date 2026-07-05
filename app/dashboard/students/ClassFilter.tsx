"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Props {
  classes: { id: string; name: string }[];
  current: string;
}

export default function ClassFilter({ classes, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(classId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (classId) {
      params.set("classId", classId);
    } else {
      params.delete("classId");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      <option value="">All classes</option>
      {classes.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
