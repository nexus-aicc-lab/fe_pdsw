import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    hasRightElement?: boolean;
  }
>(({ className, hasRightElement, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-[26px] w-full rounded-[3px] border border-input bg-white px-[8px] transition-colors file:border-0 file:bg-white file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-[#aaa] disabled:bg-[#F4F4F4] border-[#ebebeb] text-[#333] text-sm",
        hasRightElement && "pr-9",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";



const OnlyNumberInput = React.forwardRef<
HTMLInputElement, 
React.InputHTMLAttributes<HTMLInputElement> >(
  ({ className, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [value, setValue] = React.useState<string>(
        props.defaultValue?.toString() || props.value?.toString() || ""
    );

    // 값 변경 시 내부 상태 업데이트
    React.useEffect(() => {
    if (props.value !== undefined) {
        setValue(props.value.toString());
    }
    }, [props.value]);

    // 키 입력 막기
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

        const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

        const isCtrlCombo = e.ctrlKey; 
        const isNumber = /^[0-9]$/.test(e.key);
        const isAllowed = allowedKeys.includes(e.key);
        
        if (!isNumber && !isAllowed && !isCtrlCombo) {
            e.preventDefault();
        }
    };

    

    // 숫자만 반영
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const isNumber = /^[0-9]+$/.test(e.target.value);
        // const newValue = e.target.value;
        
        // if (props.onChange && isNumber) {            
        //     props.onChange(e);
        //     setValue(newValue);
        // }

        const newValue = e.target.value.replace(/\D/g, ''); // 숫자만 남김

        if (props.onChange) {
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: newValue,
                },
            };
            props.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
    };



    return (
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        value={value}
        className={cn(className)}
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
      />
    );
  }
);

OnlyNumberInput.displayName = "NumeberTextInput";

export default OnlyNumberInput;
