"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { Privileges } from "@/lib/privileges";

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}
function IconAcademic() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}
function IconCreditCard() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  );
}
function IconChartBar() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V3.375zM9.75 7.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v12.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V7.125z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem { label: string; href: string }
interface NavGroup { label: string; icon: React.ReactNode; items: NavItem[] }
interface Props { privileges: Privileges; isAdmin: boolean; tenantSlug?: string }

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardSidebar({ privileges, isAdmin, tenantSlug }: Props) {
  const pathname = usePathname();

  // ── Build groups ────────────────────────────────────────────────────────────
  const groups: NavGroup[] = [];

  groups.push({
    label: "Overview",
    icon: <IconGrid />,
    items: [{ label: "Dashboard", href: "/dashboard" }],
  });

  if (isAdmin || privileges.canViewApplications) {
    groups.push({
      label: "Admissions",
      icon: <IconClipboard />,
      items: [{ label: "Applications", href: "/dashboard/applications" }],
    });
  }

  const academicItems: NavItem[] = [];
  if (privileges.canViewStudents)
    academicItems.push({ label: "Students", href: "/dashboard/students" });
  if (isAdmin || privileges.canManageClasses)
    academicItems.push({ label: "Classes", href: "/dashboard/classes" });
  if (privileges.canManageGrades || privileges.canViewAllGrades)
    academicItems.push({ label: "Grades", href: "/dashboard/grades" });
  if (academicItems.length > 0)
    groups.push({ label: "Academics", icon: <IconAcademic />, items: academicItems });

  if (privileges.canViewInvoices) {
    groups.push({
      label: "Finance",
      icon: <IconCreditCard />,
      items: [{ label: "Invoices", href: "/dashboard/invoices" }],
    });
  }

  if (privileges.canViewReports || privileges.canPublishResults) {
    const resultItems: NavItem[] = [{ label: "Results", href: "/dashboard/results" }];
    if (privileges.canPublishResults)
      resultItems.push({ label: "Scratch Cards", href: "/dashboard/scratch-cards" });
    groups.push({ label: "Results", icon: <IconChartBar />, items: resultItems });
  }

  if (isAdmin) {
    groups.push({
      label: "Staff",
      icon: <IconUsers />,
      items: [
        { label: "Teachers", href: "/dashboard/teachers" },
        { label: "Privileges", href: "/dashboard/teachers/privileges" },
      ],
    });
  }

  if (isAdmin && tenantSlug) {
    groups.push({
      label: "School",
      icon: <IconBuilding />,
      items: [
        { label: "Edit details", href: `/schools/${tenantSlug}/edit` },
        { label: "Terms", href: "/dashboard/terms" },
      ],
    });
  }

  // ── Active helpers ──────────────────────────────────────────────────────────

  function isItemActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function getActiveGroupLabel(): string {
    for (const g of groups) {
      if (g.items.some((item) => isItemActive(item.href))) return g.label;
    }
    return groups[0]?.label ?? "";
  }

  const activeGroupLabel = getActiveGroupLabel();

  // manualOpen: lets user expand a non-active group to peek
  const [manualOpen, setManualOpen] = useState<string | null>(null);

  // Clear peek when route changes
  useEffect(() => {
    setManualOpen(null);
  }, [activeGroupLabel]);

  function isGroupOpen(label: string): boolean {
    return label === activeGroupLabel || label === manualOpen;
  }

  function handleGroupClick(label: string) {
    if (label === activeGroupLabel) return;
    setManualOpen((prev) => (prev === label ? null : label));
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <nav className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-20">
      {groups.map((group, groupIndex) => {
        const open = isGroupOpen(group.label);
        const groupHasActive = group.items.some((item) => isItemActive(item.href));

        return (
          <div key={group.label} className={groupIndex > 0 ? "border-t border-gray-100" : ""}>

            {/* ── Group header (no chevron) ── */}
            <button
              type="button"
              onClick={() => handleGroupClick(group.label)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${
                groupHasActive ? "text-blue-700" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className={groupHasActive ? "text-blue-600" : "text-gray-400"}>
                {group.icon}
              </span>
              {group.label}
            </button>

            {/* ── Items ── */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="pb-2 ml-[30px]">
                {group.items.map((item, itemIndex) => {
                  const active = isItemActive(item.href);
                  const isLast = itemIndex === group.items.length - 1;

                  return (
                    <li key={item.href} className="relative flex items-center">
                      {/*
                        One SVG per item — 16px wide, 40px tall.
                        Trunk: vertical line top→mid (all items) + mid→bottom (non-last).
                        Curve: M 1.5 20  C 1.5 30, 8 32, 16 32
                        This was the version that looked right — curve tips at y=32
                        which renders near the text midpoint of the 40px row.
                      */}
                      <svg
                        className="absolute left-0 top-0 shrink-0 pointer-events-none"
                        width="16"
                        height="44"
                        viewBox="0 0 16 44"
                        fill="none"
                        aria-hidden="true"
                      >
                        {/* Trunk top → mid */}
                        <line x1="1.5" y1="0" x2="1.5" y2="22"
                          stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
                        {/* Trunk mid → bottom (non-last only) */}
                        {!isLast && (
                          <line x1="1.5" y1="22" x2="1.5" y2="44"
                            stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
                        )}
                        {/* Curve: from mid (1.5,22) sweeping to tip at (16,22) via downward bow */}
                        <path
                          d="M 1.5 22 C 1.5 32, 8 34, 16 34"
                          stroke="#d1d5db" strokeWidth="1.5"
                          strokeLinecap="round" fill="none"
                        />
                      </svg>

                      <Link
                        href={item.href}
                        className={`flex-1 flex items-center justify-between ml-5 mr-3 pl-2 pr-3 py-3 rounded-md text-sm transition-colors ${
                          active
                            ? "text-blue-700 font-medium bg-blue-50"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                        {/* {active && (
                          <span className="ml-2 h-5 w-[3px] rounded-full bg-blue-600 shrink-0" />
                        )} */}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>
        );
      })}
    </nav>
  );
}
