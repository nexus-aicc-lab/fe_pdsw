// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface LoginFormData {
  user_name: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  formData: LoginFormData;
  onFormDataChange: (data: LoginFormData) => void;
  onSubmit: (formData: LoginFormData) => void;
  isPending?: boolean;
  className?: string;
}

export default function LoginForm({
  formData,
  onFormDataChange,
  onSubmit,
  isPending = false,
  className = ""
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (updates: Partial<LoginFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <Card className={`w-[500px] shadow-none border-0 py-7 px-10 ${className}`}>
      {/* 로고 */}
      <div className="flex mb-8 mb-70">
        <Image
          src="/logo/pds-logo.svg"
          alt="U PDS"
          width={200}
          height={70}
          priority
        />
      </div>
      
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 아이디 입력 필드 */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                <Image
                  src="/logo/icon_id.svg"
                  alt="id"
                  width={14}
                  height={16}
                  priority
                />
              </div>
              <Input
                type="text"
                placeholder="아이디를 입력하세요"
                className="input-field"
                value={formData.user_name}
                onChange={(e) => updateFormData({ user_name: e.target.value })}
                disabled={isPending}
                required
              />
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                <Image
                  src="/logo/icon_pw.svg"
                  alt="password"
                  width={14}
                  height={19}
                  priority
                />
              </div>
              <div className="relative flex-grow">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => updateFormData({ password: e.target.value })}
                  disabled={isPending}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 기억하기 체크박스 */}
          <div className="flex items-center justify-end mt-10 gap-2">
            <Checkbox
              id="remember"
              checked={formData.remember}
              onCheckedChange={(checked) =>
                updateFormData({ remember: checked as boolean })
              }
              className="peer h-5 w-5 rounded-full border border-[#8E8E8E] data-[state=checked]:!border-[#8E8E8E] focus:ring-0 focus:outline-none transition-colors duration-200"
              disabled={isPending}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium cursor-pointer select-none"
            >
              ID 기억하기
            </label>
          </div>

          {/* 로그인 버튼 */}
          <Button
            variant="login"
            type="submit"
            className="mt-12 w-full"
            disabled={isPending}
          >
            {isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}