// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
 {
   variants: {
     variant: {
       default:
         "rounded-[3px] bg-[#56CAD6] text-white text-[13px] hover:bg-[#56CAD6]/90",
       destructive:
         "rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90",
       outline:
         "rounded-[3px] border border-input bg-background hover:bg-accent hover:text-accent-foreground text-[#777] border-[#777]",
       secondary:
         " bg-[#B3B3B3] rounded-[3px] text-white items-center",
       ghost: 
         "bg-transparent hover:bg-gray-100",
       link: 
         "text-primary underline-offset-4 hover:underline",
       datapicker: 
         "flex h-7 w-full items-center justify-between whitespace-nowrap rounded-[3px] border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:text-[#aaa] disabled:bg-[#F4F4F4] [&>span]:line-clamp-1 border-[#ebebeb]",
       menu:
         "bg-white hover:bg-gray-50 rounded-md min-w-[76px] py-1.5 h-auto flex flex-col items-center justify-center",
       menuActive:
         "relative bg-[#56CAD6] hover:bg-[#56CAD6] font-medium rounded-md min-w-[76px] py-1.5 h-auto flex flex-col items-center justify-center text-[#fff]",
       menuOpened:
         "bg-[#E5F3F3]/50 hover:bg-[#E5F3F3]/70 rounded-md min-w-[76px] py-1.5 h-auto flex flex-col items-center justify-center text-[#333]",
        login: 
         'w-full h-12 bg-[#55BEC8] hover:bg-[#009EAD] text-white text-sm rounded-none font-16',
       customblue:"rounded-[3px] bg-[#51ADD4] text-white text-[13px]"
     },
     size: {
        default: "py-0.5 px-1.5",
       sm: "h-8 px-3 text-xs",
       lg: "h-10 px-8",
       icon: "h-9 w-9",
       none: "",
     },
   },
   defaultVariants: {
     variant: "default",
     size: "default",
   },
 }
)


export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
   VariantProps<typeof buttonVariants> {
 asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
   const Comp = asChild ? Slot : "button"
   return (
     <Comp
       className={cn(buttonVariants({ variant, size, className }))}
       ref={ref}
       {...props}

       
     />
   )
 }
)
Button.displayName = "Button"

export { Button, buttonVariants }