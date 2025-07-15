"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { TopNavigation } from "@/src/components/top-navigation";

export default function SignupLandingPage() {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopNavigation showBackButton={true} title="" />
      <div className="flex flex-col justify-between flex-1 px-12 py-8">
        <div>
          <p
            className="text-lg text-black mt-10 mb-[75px]"
            style={{ fontWeight: 500 }}
          >
            이름을 알려주세요
          </p>
          <label
            style={{ color: focus ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
          >
            이름
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            className="w-full h-10 pr-3 pl-0 bg-white border-0 border-b-2 border-gray-300 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-[#2978EE] focus-visible:ring-0 focus-visible:outline-none text-base"
            inputMode="text"
            enterKeyHint="done"
            style={{ scrollMarginTop: 100 }}
          />
        </div>
      </div>
      <div className="mb-9 flex justify-center">
        <Button className="w-[90%] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-sm mt-10 text-sm shadow-lg hover:shadow-lg">
          다음
        </Button>
      </div>
    </div>
  );
}
