import * as React from "react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

interface CustomInputForTimeProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

const CustomInputForTime = React.forwardRef<HTMLInputElement, CustomInputForTimeProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    // Create a combined ref that works with both the forwarded ref and our internal ref
    const combinedRef = (node: HTMLInputElement) => {
      // Update our internal ref
      inputRef.current = node;
      // Forward the ref if it exists
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Format the input value for display
    const displayValue = React.useMemo(() => {
      if (!value) return '';
      
      // If value has 1 or 2 digits, show as is
      if (value.length <= 2) {
        return value;
      }
      
      // If value has 3 or 4 digits, format as HH:MM
      const hours = value.substring(0, 2);
      const minutes = value.substring(2);
      return `${hours}:${minutes}`;
    }, [value]);

    const validateTime = (timeStr: string): boolean => {
      if (timeStr.length !== 4) return false;
      
      const hours = parseInt(timeStr.substring(0, 2), 10);
      const minutes = parseInt(timeStr.substring(2), 10);
      
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    };


    const [keyPressed, setKeyPressed] = React.useState<string | null>(null); // 키 저장

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      setKeyPressed(e.key); // key 값을 state로 저장
    };




    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
    
      // 현재 커서 위치 저장
      const cursorPosition = e.target.selectionStart ?? 0;
      const prevFormatted = e.target.value;
    
      // 입력값에서 숫자만 추출
      newValue = newValue.replace(/[^0-9]/g, '');
    
      // 최대 4자리로 제한
      if (newValue.length > 4) {
        newValue = newValue.substring(0, 4);
      }
    
      onChange(newValue);

      setTimeout(() => {
        if (inputRef.current) {
          let adjustedCursor = cursorPosition;
          
          // 1. 18:20에서 0 뒤(backspace, cursorPosition === 5) → 18:2, 커서는 2 뒤(3)에 있어야 함
          if (
            prevFormatted.length === 5 &&
            newValue.length === 3 &&
            (cursorPosition === 5 || cursorPosition === 5)
          ) {
            adjustedCursor = 3;
          }
          // 2. 18:20에서 2와 0 사이(backspace, cursorPosition === 4) → 18:0, 커서는 0 앞(3)에 있어야 함
          if (
            prevFormatted.length === 4 &&
            newValue.length === 3 &&
            cursorPosition === 3
          ) {
            adjustedCursor = 3;
          }
          // 3. 3자리 입력 시 콜론 추가로 커서 한 칸 뒤로
          else if (newValue.length === 3 && cursorPosition === 3) {
            adjustedCursor = 4;
          }
          // 4. 4자리 입력 시 콜론 포함 커서 한 칸 뒤로
          else if (newValue.length === 4 && cursorPosition === 4) {
            adjustedCursor = 5;
          }
          // 5. 콜론 앞에서 삭제 시(2자리로 줄어들 때)
          else if (newValue.length === 2 && prevFormatted.includes(":") && cursorPosition === 3) {
            adjustedCursor = 2;
          }
          // : 를 기준으로 backspace나 delete키를 누를때
          else if (newValue.length === 4 && !prevFormatted.includes(":") && cursorPosition === 2) {

            if (keyPressed === "Backspace") {
              adjustedCursor = 2;
            } else if (keyPressed === "Delete") {
              adjustedCursor = 3; 
            }
          }
          inputRef.current.setSelectionRange(adjustedCursor, adjustedCursor);
        }

      }, 0);
      
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const validationErrorToastId = 'time-validation-error'; // 고유 ID 정의
  
      if (value.length === 4) {
        if (!validateTime(value)) {
          // 동일 ID 토스트가 이미 떠있으면 새로 띄우지 않음
          toast.error("잘못된 시간 형식입니다. 올바른 시간을 입력하세요 (00:00-23:59).", {
            toastId: validationErrorToastId
          });
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 100);
        }
      } else if (value.length > 0) {
        toast.error("잘못된 시간 형식입니다. 올바른 시간을 입력하세요 (00:00-23:59).", {
           toastId: validationErrorToastId // 동일 ID 사용 또는 다른 ID 사용 가능
        });
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
  
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <input
        type="text"
        className={cn(
          "flex h-[26px] w-full rounded-[3px] border border-input bg-white px-[8px] transition-colors file:border-0 file:bg-white file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-[#aaa] disabled:bg-[#F4F4F4] border-[#ebebeb] text-[#333] text-sm",
          className
        )}
        ref={combinedRef}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        maxLength={5} // 5 characters for format HH:MM
        placeholder="hh:mm"
        {...props}
      />
    );
  }
);

CustomInputForTime.displayName = "CustomInputForTime";

export default CustomInputForTime;