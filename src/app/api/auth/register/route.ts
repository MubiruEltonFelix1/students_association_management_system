import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  phoneNumber: z.string().optional(),
  course: z.string().min(1, "Course is required"),
  yearGroup: z.number().min(1).max(4),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      registrationNumber,
      phoneNumber,
      course,
      yearGroup,
      password,
    } = parsed.data;

    // Check for existing user
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const existingReg = await prisma.user.findUnique({
      where: { registrationNumber },
    });
    if (existingReg) {
      return NextResponse.json(
        { error: "A user with this registration number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        registrationNumber,
        phoneNumber: phoneNumber || null,
        course,
        yearGroup,
        passwordHash,
        membershipStatus: "ACTIVE",
        role: "MEMBER",
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          registrationNumber: user.registrationNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
