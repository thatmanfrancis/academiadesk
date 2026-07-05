import prisma from "@/lib/prisma";

export type Privileges = {
  canViewStudents: boolean;
  canManageGrades: boolean;
  canViewAllGrades: boolean;
  canManageAttendance: boolean;
  canViewInvoices: boolean;
  canManageInvoices: boolean;
  canViewApplications: boolean;
  canManageClasses: boolean;
  canViewReports: boolean;
  canPublishResults: boolean;
};

/** Admin always has every privilege. */
export const ADMIN_PRIVILEGES: Privileges = {
  canViewStudents: true,
  canManageGrades: true,
  canViewAllGrades: true,
  canManageAttendance: true,
  canViewInvoices: true,
  canManageInvoices: true,
  canViewApplications: true,
  canManageClasses: true,
  canViewReports: true,
  canPublishResults: true,
};

/** Default (no-privilege) teacher — only what's always allowed. */
export const DEFAULT_TEACHER_PRIVILEGES: Privileges = {
  canViewStudents: true,
  canManageGrades: false,
  canViewAllGrades: false,
  canManageAttendance: false,
  canViewInvoices: false,
  canManageInvoices: false,
  canViewApplications: false,
  canManageClasses: false,
  canViewReports: false,
  canPublishResults: false,
};

/**
 * Fetch the effective privileges for a user.
 * Returns ADMIN_PRIVILEGES for ADMINs, looks up TeacherPrivilege for TEACHERs,
 * and returns null for roles that don't have dashboard access.
 */
export async function getUserPrivileges(userId: string): Promise<Privileges | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      teacher: {
        select: {
          privilege: true,
        },
      },
    },
  });

  if (!user) return null;

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return ADMIN_PRIVILEGES;
  }

  if (user.role === "TEACHER") {
    const p = user.teacher?.privilege;
    if (!p) return DEFAULT_TEACHER_PRIVILEGES;
    return {
      canViewStudents: p.canViewStudents,
      canManageGrades: p.canManageGrades,
      canViewAllGrades: p.canViewAllGrades,
      canManageAttendance: p.canManageAttendance,
      canViewInvoices: p.canViewInvoices,
      canManageInvoices: p.canManageInvoices,
      canViewApplications: p.canViewApplications,
      canManageClasses: p.canManageClasses,
      canViewReports: p.canViewReports,
      canPublishResults: p.canPublishResults,
    };
  }

  return null;
}

/**
 * Guard helper — throws a redirect if the user lacks the required privilege.
 * Use in server components / route handlers.
 */
export function assertPrivilege(privileges: Privileges, key: keyof Privileges) {
  if (!privileges[key]) {
    throw new Error(`Missing privilege: ${key}`);
  }
}
