import { cleanupTrash } from "@/lib/db/list-actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // // Basic security: Check for a secret token if you want to prevent unauthorized access
  // const authHeader = request.headers.get('authorization');
  // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    const result = await cleanupTrash();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 },
    );
  }
}
