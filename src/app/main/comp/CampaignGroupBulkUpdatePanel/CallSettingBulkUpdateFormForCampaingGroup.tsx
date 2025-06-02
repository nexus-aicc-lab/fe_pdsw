// CallSettingBulkUpdateFormForCampaingGroup.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // shadcn/ui Tabs components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // shadcn/ui Select components
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"; // Icons

interface CallSettingBulkUpdateFormForCampaingGroupProps {
  groupId?: string | number;
}

export function CallSettingBulkUpdateFormForCampaingGroup({
  groupId,
}: CallSettingBulkUpdateFormForCampaingGroupProps = {}) {
  // Main 탭 목록
  const tabs = [
    { key: "registrationTime", label: "등록시간" },
    { key: "callingOrder", label: "발신 순서" },
    { key: "callingStrategy", label: "발신전략" },
    { key: "callingMethod", label: "발신방법" },
    { key: "callLineCount", label: "콜라인수" },
    { key: "lunarCalendar", label: "음력" },
    { key: "assignedCounselor", label: "할당상담사" },
    { key: "otherInfo", label: "기타정보" },
  ];

  // 선택된 탭 상태 관리 (기본값 "registrationTime")
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  // 전화번호 탭 목록 (발신 순서 탭 내부에서 사용)
  const phoneNumbers = [
    { id: 1, label: "고객 전화번호(1)" },
    { id: 2, label: "고객 전화번호(2)" },
    { id: 3, label: "고객 전화번호(3)" },
    { id: 4, label: "고객 전화번호(4)" },
    { id: 5, label: "고객 전화번호(5)" },
  ];

  // 발신 순서 탭 외 다른 탭의 기본 내용 (placeholder)
  const tabContents: { [key: string]: string } = {
    registrationTime: "등록시간 관련 내용을 여기에 표시합니다.",
    callingStrategy: "발신전략 관련 내용을 여기에 표시합니다.",
    callingMethod: "발신방법 관련 내용을 여기에 표시합니다.",
    callLineCount: "콜라인수 관련 내용을 여기에 표시합니다.",
    lunarCalendar: "음력 관련 내용을 여기에 표시합니다.",
    assignedCounselor: "할당상담사 관련 내용을 여기에 표시합니다.",
    otherInfo: "기타정보 관련 내용을 여기에 표시합니다.",
  };

  const [selectedPhoneId, setSelectedPhoneId] = useState<number | null>(null); // 선택된 Phone ID
  const [selectedPhoneNumberTab, setSelectedPhoneNumberTab] = useState<number>(1);  //선택된 번호 탭
  const [leftPhoneNumbers, setLeftPhoneNumbers] = useState(phoneNumbers); // 왼쪽 전화번호 목록
  const [rightPhoneNumbers, setRightPhoneNumbers] = useState<{ id: number, label: string }[]>([]); // 오른쪽 전화번호 목록 (순서 포함)


  // 오른쪽으로 전화번호 이동
  const moveNumberToRight = () => {
    if (selectedPhoneId) {
      const selectedNumber = leftPhoneNumbers.find(num => num.id === selectedPhoneId);
      if (selectedNumber) {
        setRightPhoneNumbers([...rightPhoneNumbers, selectedNumber]);
        setLeftPhoneNumbers(leftPhoneNumbers.filter(num => num.id !== selectedPhoneId));
        setSelectedPhoneId(null); // 선택 해제
      }
    }
  };

  // 왼쪽으로 전화번호 이동
  const moveNumberToLeft = () => {
    if (selectedPhoneId) {
      const selectedNumber = rightPhoneNumbers.find(num => num.id === selectedPhoneId);
      if (selectedNumber) {
        setLeftPhoneNumbers([...leftPhoneNumbers, selectedNumber]);
        setRightPhoneNumbers(rightPhoneNumbers.filter(num => num.id !== selectedPhoneId));
        setSelectedPhoneId(null);
      }
    }
  };

  // 위로 이동
  const moveNumberUp = () => {
    if (selectedPhoneId) {
      const currentIndex = rightPhoneNumbers.findIndex(num => num.id === selectedPhoneId);
      if (currentIndex > 0) {
        const newRightPhoneNumbers = [...rightPhoneNumbers];
        const temp = newRightPhoneNumbers[currentIndex];
        newRightPhoneNumbers[currentIndex] = newRightPhoneNumbers[currentIndex - 1];
        newRightPhoneNumbers[currentIndex - 1] = temp;
        setRightPhoneNumbers(newRightPhoneNumbers);
      }
    }
  };


  // 아래로 이동
  const moveNumberDown = () => {
    if (selectedPhoneId) {
      const currentIndex = rightPhoneNumbers.findIndex(num => num.id === selectedPhoneId);
      if (currentIndex < rightPhoneNumbers.length - 1) {
        const newRightNumbers = [...rightPhoneNumbers];
        const temp = newRightNumbers[currentIndex];
        newRightNumbers[currentIndex] = newRightNumbers[currentIndex + 1];
        newRightNumbers[currentIndex + 1] = temp;
        setRightPhoneNumbers(newRightNumbers);
      }
    }
  };



  return (
    <div className="bg-white p-3 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="mb-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="px-4 py-2">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        {tabs.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="flex-1">
            {tab.key === "callingOrder" ? (
              <>
                {/* Phone ID 선택기와 전화번호 탭 */}
                <div className="flex mb-2">
                  <div className="flex items-center mr-4">
                    <label className="text-sm mr-2">Phone ID</label>
                    <Select onValueChange={(value) => setSelectedPhoneId(Number(value))}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {(leftPhoneNumbers.length > 0 ? leftPhoneNumbers : rightPhoneNumbers).map(num => (
                          <SelectItem key={num.id} value={num.id.toString()}>{num.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex border border-gray-300">
                    {phoneNumbers.map((phone) => (
                      <Button
                        key={phone.id}
                        variant={selectedPhoneNumberTab === phone.id ? "default" : "ghost"}
                        className={`px-3 py-1 text-sm ${selectedPhoneNumberTab === phone.id ? "" : ""
                          }`}
                        onClick={() => setSelectedPhoneNumberTab(phone.id)}
                      >
                        {phone.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 전화번호별 발신 순서 편집 */}
                <div className="border border-gray-300 p-2 flex-1 flex flex-col">
                  <div className="text-sm font-medium mb-2">전화 번호별 발신 순서 편집</div>

                  <div className="flex flex-1">
                    {/* 왼쪽 전화번호 목록 */}
                    <div className="w-48 border border-gray-300 mr-2 overflow-auto">
                      {leftPhoneNumbers.map((phone) => (
                        <div
                          key={phone.id}
                          className={`p-1 text-sm cursor-pointer ${selectedPhoneId === phone.id ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                            }`}
                          onClick={() => setSelectedPhoneId(phone.id)}
                        >
                          {phone.label}
                        </div>
                      ))}
                    </div>

                    {/* 중앙 이동 버튼 */}
                    <div className="flex flex-col justify-center space-y-2 mr-2">
                      <Button variant="outline" size="icon" onClick={moveNumberToRight}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={moveNumberToLeft}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* 오른쪽 전화번호 그룹 편집 */}
                    <div className="flex-1 border border-gray-300 flex flex-col">
                      <div className="flex border-b border-gray-300">
                        <div className="px-2 py-1 text-sm w-24 text-center border-r border-gray-300">순서</div>
                        <div className="flex-1 text-center py-1 text-sm">전화번호 그룹</div>
                      </div>
                      <div className="flex-1 overflow-auto">
                        {/* 전화번호 그룹 */}
                        {rightPhoneNumbers.map((phone, index) => (
                          <div
                            key={phone.id}
                            className={`flex items-center border-b border-gray-300 last:border-none ${selectedPhoneId === phone.id ? 'bg-blue-100' : ''}`}
                            onClick={() => setSelectedPhoneId(phone.id)}

                          >
                            <div className="w-24 text-center text-sm border-r border-gray-300 p-1">{index + 1}</div>
                            <div className="flex-1 p-1 text-sm">{phone.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 오른쪽 수직 이동 버튼 */}
                    <div className="flex flex-col justify-center space-y-2 ml-2">
                      <Button variant="outline" size="icon" onClick={moveNumberUp}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={moveNumberDown}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p>{tabContents[tab.key]}</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}