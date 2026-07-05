import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { schoolSearchSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsed = schoolSearchSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    lga: searchParams.get("lga") ?? undefined,
    curriculum: searchParams.get("curriculum") ?? undefined,
    schoolType: searchParams.get("schoolType") ?? undefined,
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 12,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { q, state, lga, curriculum, schoolType, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { address: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(state && { state: { equals: state, mode: "insensitive" as const } }),
    ...(lga && { lga: { equals: lga, mode: "insensitive" as const } }),
    ...(curriculum && { curriculum: { has: curriculum } }),
    ...(schoolType && {
      schoolType: { equals: schoolType, mode: "insensitive" as const },
    }),
  };

  const [schools, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        state: true,
        lga: true,
        curriculum: true,
        feeRange: true,
        logo: true,
        schoolType: true,
        _count: { select: { reviews: true, students: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.count({ where }),
  ]);

  return NextResponse.json({
    schools,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
