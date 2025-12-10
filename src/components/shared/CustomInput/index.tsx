// src/components/shared/CustomInput.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomInputProps extends React.ComponentProps<"input"> {
  /** 전체 너비 적용 여부 (기본값: true) */
  isFullWidth?: boolean;
  /** 퍼센트 입력 여부 (1-100 사이 숫자만 허용) */
  isPercent?: boolean;
  /** 전화번호 입력 여부 (010, 011 등 형식 검증) */
  isPhoneNumber?: boolean;
  /** 전화번호 유효성 콜백 */
  onValidPhoneNumber?: (isValid: boolean) => void;
  /** 외부에서 주입하는 에러 메시지 */
  error?: string;
  /** 에러 상태 리셋 트리거 키 */
  resetKey?: any;
  /** 라벨 (옵션) */
  label?: React.ReactNode;
  /** 인풋 우측에 표시할 요소 */
  rightElement?: React.ReactNode;
  /** 에러 메시지 표시 여부 */
  showError?: boolean;
  /** 컨테이너 클래스 이름 */
  containerClassName?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      className,
      containerClassName,
      isFullWidth = true,
      type = "text",
      value,
      onChange,
      onBlur,
      isPercent,
      isPhoneNumber,
      onValidPhoneNumber,
      error,
      resetKey,
      label,
      rightElement,
      showError = true,
      ...props
    },
    ref
  ) => {
    // 내부 상태 관리
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, inputRef);
    const [localError, setLocalError] = React.useState<string | undefined>(error);
    const [previousPhoneValue, setPreviousPhoneValue] = React.useState<string>("");

    // 값 문자열 변환
    const stringValue = value != null ? String(value) : "";

    // 리셋 키가 변경되면 에러 상태 초기화
    React.useEffect(() => {
      setLocalError(undefined);
    }, [resetKey]);

    // 외부 에러 반영
    React.useEffect(() => {
      if (error !== undefined) {
        setLocalError(error);
        if (error && inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, [error]);

    // 전화번호 유효성 검사 함수
    const validatePhoneNumber = (phoneNumber: string): boolean => {
      if (!phoneNumber) return true;
      return /^01[0|1|6|7|8|9][0-9]{7,8}$/.test(phoneNumber);
    };

    // 입력값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // 퍼센트 입력 검증
      if (isPercent) {
        if (!/^\d*$/.test(newValue)) {
          setLocalError("숫자만 입력 가능합니다");
          return;
        }
        if (newValue !== "") {
          const numeric = Number(newValue);
          if (numeric < 1 || numeric > 100) {
            setLocalError("1-100 사이의 값만 입력 가능합니다");
            return;
          } else {
            setLocalError(undefined);
          }
        } else {
          setLocalError(undefined);
        }
      }

      // 전화번호 입력 검증
      if (isPhoneNumber) {
        if (!/^\d*$/.test(newValue)) {
          setLocalError("숫자만 입력 가능합니다");
          return;
        }
        newValue = newValue.replace(/\D/g, "");
        setPreviousPhoneValue(newValue);
        if (newValue.length > 0) {
          if (newValue.length < 11) {
            if (localError === "유효하지 않은 전화번호 형식입니다") {
              setLocalError(undefined);
            }
          } else {
            const isValid = validatePhoneNumber(newValue);
            if (!isValid) {
              setLocalError("유효하지 않은 전화번호 형식입니다");
            } else {
              setLocalError(undefined);
            }
            onValidPhoneNumber?.(isValid);
          }
        } else {
          setLocalError(undefined);
        }
      }

      // 변경된 값 전달
      onChange?.({ ...e, target: { ...e.target, value: newValue } });
    };

    // 블러 핸들러
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isPhoneNumber) {
        const phoneNumber = e.target.value;
        if (phoneNumber !== "") {
          const isValid = validatePhoneNumber(phoneNumber);
          onValidPhoneNumber?.(isValid);
          if (!isValid) {
            setLocalError("유효하지 않은 전화번호 형식입니다");
          } else {
            setLocalError(undefined);
          }
        }
      }
      if (isPercent && e.target.value === "") {
        setLocalError("1-100 사이의 값을 입력해주세요");
      }
      onBlur?.(e);
    };

    // 전화번호 값 변경 감지
    React.useEffect(() => {
      if (isPhoneNumber && stringValue !== previousPhoneValue) {
        setPreviousPhoneValue(stringValue);
        if (stringValue.length >= 11) {
          const isValid = validatePhoneNumber(stringValue);
          if (isValid && localError === "유효하지 않은 전화번호 형식입니다") {
            setLocalError(undefined);
            onValidPhoneNumber?.(true);
          } else if (!isValid && !localError) {
            setLocalError("유효하지 않은 전화번호 형식입니다");
            onValidPhoneNumber?.(false);
          }
        } else if (stringValue === "" && localError) {
          setLocalError(undefined);
        }
      }
    }, [stringValue, isPhoneNumber, localError, onValidPhoneNumber, previousPhoneValue]);

    return (
      <div className={cn(
        "custom-input-root",
        isFullWidth && "w-full",
        containerClassName
      )}>
        {label && (
          <div className="mb-1">{label}</div>
        )}
        
        <div className={cn(
          "flex items-center",
          isFullWidth && "w-full"
        )}>
          <input
            type={type}
            value={stringValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "flex h-[26px] rounded-[3px] border border-input bg-white px-[8px] text-sm transition-colors",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:text-[#aaa] disabled:bg-[#F4F4F4]",
              // 기본 width 먼저 적용
              isFullWidth ? "w-full" : "w-auto",
              localError && "border-red-500",
              className // 사용자 className이 나중에 적용되어 덮어씀
            )}
            ref={combinedRef}
            {...props}
          />
          
          {isPercent && <span className="ml-2 flex-shrink-0">%</span>}
          {rightElement && <div className="ml-2 flex-shrink-0">{rightElement}</div>}
        </div>
        
        {showError && localError && (
          <div className="text-red-500 text-xs mt-1">{localError}</div>
        )}
      </div>
    );
  }
);

// 여러 ref를 결합하는 유틸리티 함수
function useCombinedRefs<T>(
  ...refs: Array<React.Ref<T> | null | undefined>
): React.RefCallback<T> {
  return React.useCallback(
    (element: T) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === 'function') {
          ref(element);
        } else {
          (ref as React.MutableRefObject<T>).current = element;
        }
      });
    },
    [refs]
  );
}

CustomInput.displayName = "CustomInput";

export { CustomInput };