import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createSchoolSchema } from "@/lib/schemas";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const school = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      state: true,
      lga: true,
      phone: true,
      website: true,
      curriculum: true,
      feeRange: true,
      logo: true,
      schoolType: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { students: true, classes: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          parentName: true,
          rating: true,
          comment: true,
          isVerified: true,
          createdAt: true,
        },
      },
    },
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const avgRating =
    school.reviews.length > 0
      ? school.reviews.reduce((sum, r) => sum + r.rating, 0) / school.reviews.length
      : null;

  return NextResponse.json({ ...school, avgRating });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  // Verify the logged-in user owns this school
  const school = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, users: { select: { id: true } } },
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const isOwner = school.users.some((u) => u.id === session.user!.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchoolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.tenant.update({
    where: { id: school.id },
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      state: parsed.data.state,
      lga: parsed.data.lga,
      phone: parsed.data.phone ?? null,
      website: parsed.data.website || null,
      schoolType: parsed.data.schoolType,
      curriculum: parsed.data.curriculum,
      feeRange: parsed.data.feeRange ?? null,
    },
    select: { slug: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}
