"use client";

import { useRouter } from "next/navigation";
import { sendJson, type ApiResult } from "@/lib/api-client";

const NETWORK_ERROR = "Cannot reach the server. Check your connection and try again.";

async function request(
  method: "PATCH" | "POST",
  url: string,
  body: unknown
): Promise<ApiResult> {
  try {
    return await sendJson(method, url, body);
  } catch {
    throw new Error(NETWORK_ERROR);
  }
}

function messageFrom(result: ApiResult, field: string, fallback: string) {
  return result.data.errors?.[field] ?? result.data.message ?? fallback;
}

export function useAccountActions() {
  const router = useRouter();

  async function saveUsername(username: string) {
    const result = await request("PATCH", "/api/account/username", { username });
    if (!result.ok) {
      if (result.status === 401) router.push("/login");
      throw new Error(messageFrom(result, "username", "Could not update username."));
    }
    router.refresh(); // ให้ sidebar ดึงชื่อใหม่
  }

  async function updatePassword(data: { currentPassword: string; newPassword: string }) {
    const result = await request("PATCH", "/api/account/password", data);
    if (!result.ok) {
      if (result.status === 401) router.push("/login");
      const field = result.data.errors?.currentPassword ? "currentPassword" : "newPassword";
      throw new Error(messageFrom(result, field, "Could not change password."));
    }
  }

  async function deleteAccount(password: string) {
    const result = await request("POST", "/api/account/delete", { password });
    if (!result.ok) {
      throw new Error(messageFrom(result, "password", "Could not delete account."));
    }
    router.push("/login");
    router.refresh();
  }

  async function logoutAllDevices() {
    const result = await request("POST", "/api/auth/logout-all", {});
    if (!result.ok) {
      throw new Error(messageFrom(result, "form", "Could not log out of all devices."));
    }
    router.push("/login");
    router.refresh();
  }

  return { saveUsername, updatePassword, deleteAccount, logoutAllDevices };
}