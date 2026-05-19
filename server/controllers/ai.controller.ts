import { Request,Response } from "express"; import { askCupidAI } from "../services/ai.service";
export const cupidCoach=async(req:Request,res:Response)=>res.json({success:true,message:"Coach",data:{answer:await askCupidAI(req.body.prompt,false)}});
export const helpNow=async(req:Request,res:Response)=>res.json({success:true,message:"Help",data:{answer:await askCupidAI(req.body.prompt,true)}});
