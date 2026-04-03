"use server";

import { signIn as customSignIn } from "@/lib/auth";

export const EmailSignInAction = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const result = await customSignIn({ email: data.email, password: data.password });
    console.log("result is ", result);
    return {
      status: true,
      user: result.user,
    };
  } catch (error: any) {
    return {
      status: false,
      message: error?.message || "Login failed",
    };
  }
};