import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    let body: { email?: unknown; password?: unknown };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
            { status: 400 }
        );
    }

    const { email, password } = body;

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return NextResponse.json(
            { error: "กรุณากรอก email และ password" },
            { status: 400 }
        );
    }

    if (!isValidEmail(email)) {
        return NextResponse.json(
            { error: "รูปแบบ email ผิด" },
            { status: 400 }
        );
    }

    function isValidEmail(email: string): boolean {
        const pattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
        return pattern.test(email);
    }

    return NextResponse.json(
        { message: "สมัครสมาชิกสำเร็จ" },
        { status: 201 });
}