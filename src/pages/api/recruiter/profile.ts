import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Proxy for backend recruiter profile
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://teachnowbackend.jobsvedika.in/api";
const PROFILE_URL = BACKEND_BASE_URL + "/recruiter/profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // Forward cookies from browser to backend
    const cookies = req.headers.cookie || "";
    
    const profileRes = await axios.get(PROFILE_URL, {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    });

    return res.status(200).json(profileRes.data);
  } catch (error: any) {
    return res.status(error?.response?.status || 500).json({ 
      message: error?.response?.data?.message || "Failed to fetch profile" 
    });
  }
}
