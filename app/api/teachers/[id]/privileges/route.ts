import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const privilegeSchema = z.object({
  canViewStudents: z.boolean(),
  canManageGrades: z.boolean(),
  canViewAllGrades: z.boolean(),
  canManageAttendance: z.boolean(),
  canViewInvoices: z.boolean(),
  canManageInvoices: z.boolean(),
  canViewApplications: z.boolean(),
  canManageClasses: z.boolean(),
  canViewReports: z.boolean(),
  canPublishResults: z.boolean(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });
  if (!adminUser || (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Verify teacher belongs to same tenant
  const teacher = await prisma.teacher.findFirst({
    where: { id, tenantId: adminUser.tenantId! },
    select: { id: true },
  });
  if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

  const body = await req.json();
  const parsed = privilegeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const privilege = await prisma.teacherPrivilege.upsert({
    where: { teacherId: id },
    update: parsed.data,
    create: { teacherId: id, ...parsed.data },
  });

  return NextResponse.json(privilege);
}
