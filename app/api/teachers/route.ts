import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createTeacherSchema = z.object({
  userId: z.string().uuid().optional(), // existing user to promote
  name: z.string().min(2),
  title: z.enum(["HEADMASTER","DEPUTY_HEADMASTER","HEAD_OF_DEPARTMENT","FORM_MASTER","CLASS_TEACHER","SUBJECT_TEACHER"]).default("SUBJECT_TEACHER"),
  subjects: z.array(z.string()).default([]),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") || !user.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const teachers = await prisma.teacher.findMany({
    where: { tenantId: user.tenantId },
    include: {
      user: { select: { email: true, image: true } },
      privilege: true,
      classes: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") || !user.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createTeacherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { name, title, subjects } = parsed.data;

  // Create a placeholder user for the teacher if no userId provided
  const teacher = await prisma.$transaction(async (tx) => {
    let targetUserId = parsed.data.userId;

    if (!targetUserId) {
      const newUser = await tx.user.create({
        data: { name, role: "TEACHER", tenantId: user.tenantId },
      });
      targetUserId = newUser.id;
    } else {
      await tx.user.update({
        where: { id: targetUserId },
        data: { role: "TEACHER", tenantId: user.tenantId },
      });
    }

    const t = await tx.teacher.create({
      data: {
        userId: targetUserId,
        tenantId: user.tenantId!,
        name,
        title,
        subjects,
        privilege: { create: {} }, // create default privilege record
      },
    });
    return t;
  });

  return NextResponse.json(teacher, { status: 201 });
}
