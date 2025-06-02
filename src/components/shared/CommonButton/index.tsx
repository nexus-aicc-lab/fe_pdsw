import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// buttonVariants 정의
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-[3px] bg-[#56CAD6] text-white text-[13px] hover:bg-[#56CAD6]/90",
        destructive: "rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "rounded-[3px] border border-input bg-background  text-[#777] border-[#a0a0a0]",
        secondary: "bg-[#B3B3B3] rounded-[3px] text-white items-center",
        ghost: "bg-transparent hover:bg-[transparent]",
        link: "text-primary underline-offset-4 hover:underline",
        datapicker:
          "flex h-7 w-full items-center justify-between whitespace-nowrap rounded-[3px] border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:text-[#aaa] disabled:bg-[#F4F4F4] [&>span]:line-clamp-1 border-[#ebebeb]",
        menu: "bg-white hover:bg-gray-50 rounded-md min-w-[76px] py-1.5 h-auto flex flex-col items-center justify-center",
        menuActive:
          "relative bg-[#56CAD6] hover:bg-[#56CAD6] font-medium rounded-md min-w-[76px] py-1.5 h-auto flex flex-col items-center justify-center text-[#fff]",
        menuOpened:
          "bg-[#E5F3F3]/50 hover:bg-[#E5F3F3]/70 rounded-md min-w-[76px] py-1.5 h-auto flex flex-col items-center justify-center text-[#333]",
        login: "w-full h-12 bg-black hover:bg-[#55BEC8] text-white text-sm rounded-none font-16",
        customblue: "rounded-[3px] bg-[#51ADD4] text-white text-[13px]",
        tabEtc: "bg-transparent hover:bg-[transparent] border-r border-t border-l border-[#ebebeb] px-[6px] h-[30px]",
        tab: "h-[30px] border-t border-l border-r border-[#ebebeb]",
      },
      size: {
        default: "text-[13px] py-[3px] px-[6px]",
        sm: "px-2 py-1 text-xs",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface CommonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const CommonButton = React.forwardRef<HTMLButtonElement, CommonButtonProps>(
  ({ children, className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

CommonButton.displayName = "CommonButton";

export { CommonButton, buttonVariants };
export default CommonButton;