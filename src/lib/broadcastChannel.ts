// src/lib/broadcastChannel.ts
export const campaignChannel = new BroadcastChannel("campaign-channel");
export const sseMessageChannel = new BroadcastChannel("sseMessage-channel");
export const logoutChannel = new BroadcastChannel('logout-channel');
