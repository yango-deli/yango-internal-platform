import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    AZURE_AD_CLIENT_ID:     process.env.AZURE_AD_CLIENT_ID     ? `set (${process.env.AZURE_AD_CLIENT_ID.slice(0,8)}...)` : "MISSING",
    AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET ? `set (length: ${process.env.AZURE_AD_CLIENT_SECRET.length})` : "MISSING",
    AZURE_AD_TENANT_ID:     process.env.AZURE_AD_TENANT_ID     ? `set (${process.env.AZURE_AD_TENANT_ID.slice(0,8)}...)` : "MISSING",
    NEXTAUTH_URL:           process.env.NEXTAUTH_URL            ?? "MISSING",
    NEXTAUTH_SECRET:        process.env.NEXTAUTH_SECRET         ? `set (length: ${process.env.NEXTAUTH_SECRET.length})` : "MISSING",
    NODE_ENV:               process.env.NODE_ENV,
    DATABASE_URL:           process.env.DATABASE_URL            ? "set" : "MISSING",
  });
}
