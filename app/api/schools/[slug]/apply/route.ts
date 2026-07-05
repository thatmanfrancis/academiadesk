import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { applicationSchema } from "@/lib/schemas";
import { generateApplicationCode } from "@/lib/generate-code";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const school = await prisma.tenant.findUnique({
    where: { slug, isPublished: true },
    select: { id: true },
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Prevent duplicate applications from same email for same school
  const existing = await prisma.admissionApplication.findFirst({
    where: {
      tenantId: school.id,
      parentEmail: parsed.data.parentEmail,
      childName: parsed.data.childName,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An application with this email and child name already exists for this school" },
      { status: 409 }
    );
  }

  // Retry on the rare chance of a code collision (birthday problem at scale)
  let application;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      application = await prisma.admissionApplication.create({
        data: {
          applicationCode: generateApplicationCode(),
          tenantId: school.id,
          parentName: parsed.data.parentName,
          parentEmail: parsed.data.parentEmail,
          childName: parsed.data.childName,
        },
      });
      break;
    } catch (e: unknown) {
      const isPrismaUniqueError =
        typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002";
      if (isPrismaUniqueError && attempt < 4) continue;
      throw e;
    }
  }

  return NextResponse.json(application, { status: 201 });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email param required" }, { status: 400 });
  }

  const school = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const applications = await prisma.admissionApplication.findMany({
    where: { tenantId: school.id, parentEmail: email },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(applications);
}
