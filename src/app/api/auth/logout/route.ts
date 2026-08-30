import { deleteCurrentSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteCurrentSession();

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to logout:",
      error
    );

    return Response.json(
      {
        error: "Failed to logout",
      },
      {
        status: 500,
      }
    );
  }
}