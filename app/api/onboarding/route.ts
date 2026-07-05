import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { onboardingSchema } from "@/lib/schemas";
import slugify from "slugify";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { role, school } = parsed.data;

  // If registering as a school admin, create the tenant first
  if (role === "ADMIN") {
    if (!school) {
      return NextResponse.json(
        { error: "School details are required for admin role" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(school.name, { lower: true, strict: true });

    // Ensure slug uniqueness
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await prisma.tenant.findUnique({ where: { slug } });
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: school.name,
        slug,
        address: school.address,
        state: school.state,
        lga: school.lga,
        phone: school.phone,
        website: school.website || null,
        schoolType: school.schoolType,
        curriculum: school.curriculum,
        feeRange: school.feeRange || null,
        isPublished: true,
        users: {
          connect: { id: session.user.id },
        },
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN", tenantId: tenant.id },
    });

    return NextResponse.json({ success: true, slug: tenant.slug }, { status: 201 });
  }

  // For parents and teachers — just set the role, no tenant yet
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
