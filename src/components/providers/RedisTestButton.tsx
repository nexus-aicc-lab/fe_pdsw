"use client";

import { useApiForRedisTest } from "@/features/campaignManager/hooks/useApiForRedisTest";

export default function RedisTestButton() {
  const redisTestMutation = useApiForRedisTest();

  return (
    <button
      onClick={() => redisTestMutation.mutate()}
      className="p-2 bg-blue-500 text-white rounded-lg"
    >
      Redis Test
    </button>
  );
}
