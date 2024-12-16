import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  console.log(`API route called at ${new Date().toISOString()}`);
  console.log(`Full URL: ${req.url}`);

  const fid = req.nextUrl.searchParams.get("fid");
  console.log(`Requested fid: ${fid}`);

  if (!fid) {
    console.log("Error: fid parameter is missing");
    return NextResponse.json(
      { error: "fid parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch data from allowances API
    const allowancesApiUrl = `https://api.degen.tips/airdrop2/allowances?fid=${fid}`;
    const pointsApiUrl = `https://api.degen.tips/airdrop2/current/points?fid=${fid}`;

    const [allowancesResponse, pointsResponse] = await Promise.all([
      axios.get(allowancesApiUrl),
      axios.get(pointsApiUrl),
    ]);

    const allowancesData = allowancesResponse.data;
    const pointsData = pointsResponse.data;

    let snapshot_day = new Date().toISOString().split("T")[0]; // Use current date
    let user_rank = "N/A";
    let tip_allowance = "N/A";
    let remaining_tip_allowance = "N/A";
    let points = "N/A";

    // Handle allowances data
    if (Array.isArray(allowancesData) && allowancesData.length > 0) {
      const firstAllowanceEntry = allowancesData[0];
      user_rank = firstAllowanceEntry.user_rank;
      tip_allowance = firstAllowanceEntry.tip_allowance;
      remaining_tip_allowance = firstAllowanceEntry.remaining_tip_allowance;
    } else {
      console.log("No data received from the allowances API");
    }

    // Handle points data
    if (Array.isArray(pointsData) && pointsData.length > 0) {
      points = pointsData[0].points;
    } else {
      console.log("No data received from the points API");
    }

    console.log("Response data:", {
      snapshot_day,
      user_rank,
      tip_allowance,
      remaining_tip_allowance,
      points,
    });

    return NextResponse.json({
      snapshot_day,
      user_rank,
      tip_allowance,
      remaining_tip_allowance,
      points,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
