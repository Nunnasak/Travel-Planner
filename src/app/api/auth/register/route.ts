import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const { email, password }:{ email: string; password: string } = await req.json();

    if (!email || !password) {
        return NextResponse.json(
            { error: "กรุณากรอก email และ password" },
            { status: 400 }
        );
    }


    return NextResponse.json(
        { message: "สมัครสมาชิกสำเร็จ" },
        { status: 201 });
}