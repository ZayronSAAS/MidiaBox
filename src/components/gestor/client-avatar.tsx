"use client"

import { cn } from "@/lib/utils"

interface ClientAvatarProps {
  name: string
  color: string
  logo?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-11 h-11 text-base",
  xl: "w-14 h-14 text-lg",
}

export function ClientAvatar({ name, color, logo, size = "md", className }: ClientAvatarProps) {
  const sizeClass = sizeMap[size]

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className={cn("rounded-xl object-cover flex-shrink-0", sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0",
        sizeClass,
        className
      )}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
