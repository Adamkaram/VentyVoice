"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import styles from "./snake-border-textarea.module.css"

// Theme configuration
const THEME = {
  colors: {
    main: "#ff9066", // Main bright orange for the snake
    accent: "#ffae8a", // Lighter orange for snake gradient tail
    staticGlow: "rgba(255, 144, 102, 0.25)", // Fainter glow for static border
    snakeGlow: "rgba(255, 144, 102, 0.8)", // Stronger glow for the snake
    textareaBackground: {
      focused: "#1a0c05",
      unfocused: "#1f1209"
    },
    text: {
      focused: "#ffc5ab",
      unfocused: "#ffdab3"
    },
    placeholder: {
      focused: "rgba(255, 218, 179, 0.6)",
      unfocused: "rgba(255, 218, 179, 0.4)"
    }
  },
  animation: {
    duration: "4s",
    snakeLength: "80px",
    borderWidth: "2px"
  }
} as const

interface SnakeBorderTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Optional override for the snake animation duration */
  animationDuration?: string;
  /** Optional override for the snake length */
  snakeLength?: string;
  /** Optional override for the border width */
  borderWidth?: string;
}

/**
 * SnakeBorderTextarea is a custom textarea component with an animated snake border effect.
 * It extends the base Shadcn Textarea component with a glowing border that moves around the edges.
 */
export const SnakeBorderTextarea = React.forwardRef<HTMLTextAreaElement, SnakeBorderTextareaProps>(
  ({ className, animationDuration, snakeLength, borderWidth, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    // CSS Variables for the component's theme
    const cssVariables = {
      ["--main-color" as string]: THEME.colors.main,
      ["--accent-color" as string]: THEME.colors.accent,
      ["--static-glow-color" as string]: THEME.colors.staticGlow,
      ["--snake-glow-color" as string]: THEME.colors.snakeGlow,
      ["--animation-duration" as string]: animationDuration || THEME.animation.duration,
      ["--snake-length" as string]: snakeLength || THEME.animation.snakeLength,
      ["--border-width" as string]: borderWidth || THEME.animation.borderWidth,
      ["--textarea-bg" as string]: isFocused 
        ? THEME.colors.textareaBackground.focused 
        : THEME.colors.textareaBackground.unfocused,
      ["--textarea-text-color" as string]: isFocused 
        ? THEME.colors.text.focused 
        : THEME.colors.text.unfocused,
      ["--textarea-placeholder-color" as string]: isFocused
        ? THEME.colors.placeholder.focused
        : THEME.colors.placeholder.unfocused,
    }

    return (
      <div
        className={cn(styles.wrapper)}
        style={{
          ...cssVariables,
          transition: "background-color 0.3s, color 0.3s",
        }}
      >
        <Textarea
          className={cn(
            "relative z-20 w-full border-0 resize-none rounded-[calc(0.5rem-var(--border-width))]",
            "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-300 ease-in-out",
            className,
          )}
          style={{
            backgroundColor: "var(--textarea-bg)",
            color: "var(--textarea-text-color)",
            margin: "var(--border-width)",
            minHeight: props.rows ? `calc(${props.rows * 1.5}em + 1.5rem)` : undefined,
          }}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)

SnakeBorderTextarea.displayName = "SnakeBorderTextarea" 