import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { reviewSchema } from "@/lib/schemas";

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
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const review = await prisma.publicReview.create({
    data: {
      tenantId: school.id,
      parentName: parsed.data.parentName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function GET(
  _req: Request,
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

  const reviews = await prisma.publicReview.findMany({
    where: { tenantId: school.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}
