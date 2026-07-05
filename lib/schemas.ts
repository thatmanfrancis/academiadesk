import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  role: z.enum(["ADMIN", "PARENT", "TEACHER"]),
  // For school admins registering their school
  school: z
    .object({
      name: z.string().min(2, "School name is required"),
      address: z.string().min(5, "Address is required"),
      state: z.string().min(1, "State is required"),
      lga: z.string().min(1, "LGA is required"),
      phone: z.string().optional(),
      website: z.string().url().optional().or(z.literal("")),
      schoolType: z.string().min(1, "School type is required"),
      curriculum: z.array(z.string()).min(1, "Select at least one curriculum"),
      feeRange: z.string().optional(),
    })
    .optional(),
});

export const createSchoolSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  state: z.string().min(1),
  lga: z.string().min(1),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  schoolType: z.string().min(1),
  curriculum: z.array(z.string()).min(1),
  feeRange: z.string().optional(),
});

export const reviewSchema = z.object({
  parentName: z.string().min(2, "Name is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export const applicationSchema = z.object({
  parentName: z.string().min(2, "Parent name is required"),
  parentEmail: z.string().email("Invalid email address"),
  childName: z.string().min(2, "Child name is required"),
});

export const schoolSearchSchema = z.object({
  q: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  curriculum: z.string().optional(),
  schoolType: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type SchoolSearchInput = z.infer<typeof schoolSearchSchema>;
