import { Button } from "frames.js/next";
import { frames, ImageAspectRatio } from "./frames";

import { appURL, formatNumber } from "../utils";


interface State {
  lastFid?: string;
}

const frameHandler = frames(async (ctx) => {
  interface UserData {
    name: string;
    username: string;
    fid: string;
    userCreatedAt:string;
    profileDisplayName: string;
    profileImageUrl: string;
  }

  interface DegenStats {
    snapshot_day: string;
    user_rank: string;
    tip_allowance: string;
    remaining_tip_allowance: string;
    points: string;
  
  }

  let userData: UserData | undefined;
  let data: DegenStats | null = null;


  let error: string | null = null;
  let isLoading = false;

  const fetchUserData = async (fid: string) => {
    isLoading = true;
    try {
      const airstackUrl = `${appURL()}/api/profile?userId=${encodeURIComponent(
        fid
      )}`;
      const airstackResponse = await fetch(airstackUrl);
      if (!airstackResponse.ok) {
        throw new Error(
          `Airstack HTTP error! status: ${airstackResponse.status}`
        );
      }
      const airstackData = await airstackResponse.json();
      if (
        airstackData.userData.Socials.Social &&
        airstackData.userData.Socials.Social.length > 0
      ) {
        const social = airstackData.userData.Socials.Social[0];
        userData = {
          name: social.profileDisplayName || social.profileName || "Unknown",
          username: social.profileName || "unknown",
          fid: social.userId || "N/A",
          userCreatedAt:social.userCreatedAtBlockTimestamp || "N/A",
          profileDisplayName: social.profileDisplayName || "N/A",
          profileImageUrl:
            social.profileImageContentValue?.image?.extraSmall ||
            social.profileImage ||
            "",
        };
      } else {
        throw new Error("No user data found");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };

  const Degen = async (fid: string) => {
    try {
      const degenUrl = `${appURL()}/api/degen?fid=${encodeURIComponent(fid)}`;
      const fidResponse = await fetch(degenUrl);
      if (!fidResponse.ok) {
        throw new Error(`Fid HTTP error! Status: ${fidResponse.status}`);
      }
      const responseData: DegenStats = await fidResponse.json(); // Explicitly type the response
      // console.log("Response Data:", responseData);
      // console.log("Snapshot Day:", responseData.snapshot_day);
        data = responseData;
    } catch (err) {
      console.error("Error fetching Degen Stats:", err);
      error = (err as Error).message;
    }
  };
  
  
  const extractFid = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      let fid = parsedUrl.searchParams.get("userfid");

      console.log("Extracted FID from URL:", fid);
      return fid;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  let fid: string | null = null;

  if (ctx.message?.requesterFid) {
    fid = ctx.message.requesterFid.toString();
    console.log("Using requester FID:", fid);
  } else if (ctx.url) {
    fid = extractFid(ctx.url.toString());
    console.log("Extracted FID from URL:", fid);
  } else {
    console.log("No ctx.url available");
  }

  if (!fid && (ctx.state as State)?.lastFid) {
    fid = (ctx.state as State).lastFid ?? null;
    console.log("Using FID from state:", fid);
  }

  console.log("Final FID used:", fid);

  const shouldFetchData =
    fid && (!userData || (userData as UserData).fid !== fid);

  if (shouldFetchData && fid) {
    await Promise.all([fetchUserData(fid), Degen(fid)]);
  }
  const SplashScreen = () => (
<div tw="flex flex-col w-full h-full bg-[#1E293B] text-[#f5deb3] font-sans font-bold">
    <div tw="flex justify-center mt-20">
            <img
              src="https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/dda7b6c0-d6c1-4ad4-e0b5-61495dbe6a00/original"
              alt="Profile"
              tw="w-60 h-60"
            />
    </div>
    <div tw="flex items-center justify-center text-[#86e635] mt-10 text-7xl">
Check Your $DEGEN Stats
      
</div>

    </div>
  );
  // bg-[#F0F8FF]
  const ScoreScreen = () => {
    return (
      <div tw="flex flex-col w-full h-full bg-[#1e293b] text-[#FFDEAD] font-protomono">
        <div tw="flex items-center justify-center text-white mt-10">
          <img
            src={userData?.profileImageUrl}
            alt="Profile"
            tw="w-30 h-30 rounded-lg mr-4"
          />
          <div tw="flex flex-col">
            <span tw="flex text-5xl">{userData?.profileDisplayName ?? "Anonymous"}</span>
            <span tw="flex text-3xl">@{userData?.username ?? "unknown"}</span>
          </div>
        </div>
  
        <div tw="flex flex-col items-center justify-center text-[#885aee] mt-2">
          <div tw="flex text-4xl">Rank: {data?.user_rank ?? "N/A"}</div>
          <div tw="flex text-4xl">{data?.snapshot_day ?? "N/A"}</div>
          </div>
          <div tw="flex flex-col w-full p-50 py-0 text-[#86e635]">

          <div tw="flex flex-row justify-between">
            <span tw="text-5xl">Allowance:</span>
            <span tw="text-5xl">{data?.tip_allowance ?? "N/A"}</span>
          </div>
  
          <div tw="flex flex-row justify-between">
  <span tw="text-5xl">Remaining:</span>
  <div tw="flex">
    <span tw="text-5xl">{data?.remaining_tip_allowance ?? "N/A"} </span>
    <span tw="text-5xl ml-3">
      {data?.tip_allowance === "N/A" ? "" : `(${((Number(data?.remaining_tip_allowance)/Number(data?.tip_allowance)) * 100).toFixed(1) ?? "N/A"}%)`}
    </span>
  </div>
</div>

          <div tw="flex flex-row justify-between">
            <span tw="text-5xl">Points:</span>
            <span tw="text-5xl">{data?.points ?? "N/A"}</span>
          </div>
          </div>
          <div tw="flex flex-col items-center">
            <span tw="text-3xl mt-5">
      {data?.tip_allowance === "N/A" ? "Lock atleast 10,000 $DEGEN to get Allowance" : ""}
    </span>

          </div>
       
  
        <div tw="flex bg-[#FFFACD] mt-10 text-black w-full justify-end px-4">
          <div tw="text-3xl">Frame by @cashlessman.eth</div>
        </div>
      </div>
     

    );
  };
  
  const shareText1 = encodeURIComponent(
    `Check Your $DEGEN stats \n \nframe by @cashlessman.eth`
);
const shareText2 = encodeURIComponent(
  `My $DEGEN stats \n \nframe by @cashlessman.eth`
);


  const shareUrl1 = `https://warpcast.com/~/compose?text=${shareText1}&embeds[]=https://stats-degen.vercel.app/frames`;

  const shareUrl2 = `https://warpcast.com/~/compose?text=${shareText2}&embeds[]=https://stats-degen.vercel.app/frames${
    fid ? `?userfid=${fid}` : ""
  }`;


  const buttons = [];

  if (!userData) {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check Me
      </Button>,
      <Button action="link" target={shareUrl1}>
        Share
      </Button>,
         <Button
         action="link"
         target="https://warpcast.com/cashlessman.eth"
         >
        Builder 👤
       </Button>
      
    );
  } else {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check Me
      </Button>,
      <Button action="link" target={shareUrl2}>
        Share
      </Button>,
            <Button action="post"         
            target="https://warpcast.com/cashlessman.eth"
>
            Tip ↗
          </Button>,
         <Button
         action="link"
         target="https://warpcast.com/cashlessman.eth"
         >
        Builder 👤
       </Button>
      
    );
  }

  return {
    image: fid && !error ? <ScoreScreen /> : <SplashScreen /> ,
    buttons: buttons,
    // imageOptions: { aspectRatio: "1:1" },
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
