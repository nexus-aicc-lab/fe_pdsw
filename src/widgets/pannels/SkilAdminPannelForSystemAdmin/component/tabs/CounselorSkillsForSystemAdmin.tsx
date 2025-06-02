// src/widgets/panels/TenantAdmin/components/CounselorSkillsForSystemAdmin.tsx
"use client";

const CounselorSkillsForSystemAdmin = () => {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">💡 가짜 상담원-스킬 연동 데이터입니다.</p>
      <table className="w-full text-sm border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">상담원 ID</th>
            <th className="p-2 border">상담원 이름</th>
            <th className="p-2 border">스킬 목록</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2 border">1001</td>
            <td className="p-2 border">홍길동</td>
            <td className="p-2 border">영어, 컴플레인, VIP</td>
          </tr>
          <tr className="border-t">
            <td className="p-2 border">1002</td>
            <td className="p-2 border">김민수</td>
            <td className="p-2 border">중국어, 불만처리</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CounselorSkillsForSystemAdmin;
