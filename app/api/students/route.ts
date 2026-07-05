import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserPrivileges } from "@/lib/privileges";
import { z } from "zod";

const guardianSchema = z.object({
  fullName: z.string().min(2),
  relationship: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  occupation: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const healthSchema = z.object({
  bloodGroup: z.enum(["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG","UNKNOWN"]).default("UNKNOWN"),
  genotype: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  disabilities: z.array(z.string()).default([]),
  medicalConditions: z.array(z.string()).default([]),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
});

const studentCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  otherNames: z.string().optional(),
  regNumber: z.string().min(1),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  classId: z.string().min(1),
  guardians: z.array(guardianSchema).min(1, "At least one guardian is required"),
  health: healthSchema.optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const privileges = await getUserPrivileges(session.user.id);
  if (!privileges?.canViewStudents) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tenantId: true, role: true },
  });

  if (!user?.tenantId) {
    return NextResponse.json({ error: "No school associated" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = studentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { firstName, lastName, otherNames, regNumber, dateOfBirth, gender, classId, guardians, health } = parsed.data;

  // Verify class belongs to this tenant
  const cls = await prisma.class.findFirst({
    where: { id: classId, tenantId: user.tenantId },
  });
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Prevent duplicate reg number within tenant
  const existing = await prisma.student.findFirst({
    where: { regNumber, tenantId: user.tenantId },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Registration number ${regNumber} already exists` },
      { status: 409 }
    );
  }

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      otherNames,
      regNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender ?? null,
      tenantId: user.tenantId,
      classId,
      guardians: {
        create: guardians.map((g) => ({
          fullName: g.fullName,
          relationship: g.relationship,
          phone: g.phone,
          email: g.email || null,
          address: g.address,
          occupation: g.occupation,
          isPrimary: g.isPrimary,
        })),
      },
      ...(health && {
        healthRecord: {
          create: {
            bloodGroup: health.bloodGroup,
            genotype: health.genotype,
            allergies: health.allergies,
            disabilities: health.disabilities,
            medicalConditions: health.medicalConditions,
            emergencyContact: health.emergencyContact,
            emergencyPhone: health.emergencyPhone,
            doctorName: health.doctorName,
            doctorPhone: health.doctorPhone,
          },
        },
      }),
    },
    select: { id: true, regNumber: true, firstName: true, lastName: true },
  });

  return NextResponse.json(student, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const privileges = await getUserPrivileges(session.user.id);
  if (!privileges?.canViewStudents) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tenantId: true },
  });

  if (!user?.tenantId) {
    return NextResponse.json({ error: "No school" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const classId = searchParams.get("classId") ?? "";

  const students = await prisma.student.findMany({
    where: {
      tenantId: user.tenantId,
      ...(q && {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { regNumber: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(classId && { classId }),
    },
    include: { class: { select: { name: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return NextResponse.json(students);
}
