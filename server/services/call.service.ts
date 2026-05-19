import twilio from "twilio"; import { env } from "../config/env";
export const createTwilioToken=(identity:string,roomName:string)=>{const AccessToken=twilio.jwt.AccessToken; const VideoGrant=AccessToken.VideoGrant; const token=new AccessToken(env.TWILIO_ACCOUNT_SID,env.TWILIO_API_KEY,env.TWILIO_API_SECRET,{identity}); token.addGrant(new VideoGrant({room:roomName})); return token.toJwt();};
