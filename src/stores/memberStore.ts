"use client";

import { create } from "zustand";
import { Member } from "@/src/types/Member";

interface MemberStore {
  member: Member | null;
  setMember: (member: Member) => void;
  clearMember: () => void;
}

export const useMemberStore = create<MemberStore>((set) => ({
  member: null,
  setMember: (member) => set({ member }),
  clearMember: () => set({ member: null }),
}));
