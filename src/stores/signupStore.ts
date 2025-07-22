import { create } from "zustand";

interface SignupStore {
    name: string;
    phoneNumber: string;
    userId : string;
    password: string;
    appKey: string;
    appSecret: string;
    accountNumber: string;
    nickname: string;

    setName: (name: string) => void;
    setPhoneNumber: (phoneNumber: string) => void;
    setUserId: (id: string) => void;
    setPassword: (password: string) => void;
    setAppKey: (appKey: string) => void;
    setAppSecret: (appSecret: string) => void;
    setAccountNumber: (accountNumber: string) => void;
    setNickname: (nickname: string) => void;
}


export const useSignupStore = create<SignupStore>((set) => ({
    name: '',
    phoneNumber: '',
    id: '',
    password: '',
    appKey: '',
    appSecret: '',
    accountNumber: '',
    nickname: '',
    userId: '',
  
    setName: (val) => set({ name: val }),
    setPhoneNumber: (val) => set({ phoneNumber: val }),
    setPassword: (val) => set({ password: val }),
    setAppKey: (val) => set({ appKey: val }),
    setAppSecret: (val) => set({ appSecret: val }),
    setAccountNumber: (val) => set({ accountNumber: val }),
    setNickname: (val) => set({ nickname: val }),
    setUserId: (val) => set({ userId: val }),
}))
