import { NextResponse } from "next/server";
import { createUser } from "@/lib/user-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid enterprise email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      name: (name && typeof name === "string") ? name : email.split("@")[0],
      email,
      password,
    });

    return NextResponse.json(
      {
        message: "Invariant workspace node initialized successfully.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize workspace.",
      },
      { status: 400 }
    );
  }
}
