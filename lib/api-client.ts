import { headers } from "next/headers";

export async function getBaseUrl() {
  const headerList = await headers();
  return `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("host")}`;
}
