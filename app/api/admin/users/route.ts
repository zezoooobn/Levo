import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs"

export async function GET() {
  try {
    const list = await adminAuth.listUsers();
    const users = list.users.map(u => ({
      uid: u.uid,
      email: u.email,
      name: u.displayName || "",
      phone: u.phoneNumber || "",
      disabled: u.disabled
    }));

    return NextResponse.json(users);
  } catch (err) {
    console.error("ADMIN GET USERS ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { uid } = await req.json();
    await adminAuth.deleteUser(uid);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { uid, name, phone } = await req.json();

    await adminAuth.updateUser(uid, {
      displayName: name,
      phoneNumber: phone || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
