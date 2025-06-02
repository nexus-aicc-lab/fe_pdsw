"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiForRedisTest } from "../api/redis/apiForCampaign";

export const useApiForRedisTest = () => {
  return useMutation({
    mutationFn: apiForRedisTest,
    onSuccess: (data) => {
      toast.success(`✅ Redis Test Success: ${data}`);
      // console.log("✅ Redis Test Success:", data);
    },
    onError: (error) => {
      toast.error("❌ Redis Test Failed!");
      console.error("❌ Redis Test Error:", error);
    },
  });
};
