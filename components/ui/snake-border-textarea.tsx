"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface SnakeBorderTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // CSS variables will be used directly in the style tag
}

export const SnakeBorderTextarea = React.forwardRef<HTMLTextAreaElement, SnakeBorderTextareaProps>(
  ({ className, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    // Define colors and animation properties
    const mainColor = "#ff9066" // Main bright orange for the snake
    const accentColor = "#ffae8a" // Lighter orange for snake gradient tail
    const staticGlowColor = "rgba(255, 144, 102, 0.25)" // Fainter glow for static border
    const snakeGlowColor = "rgba(255, 144, 102, 0.8)" // Stronger glow for the snake
    const animationDuration = "4s"
    const snakeLength = "80px"
    const borderWidth = "2px" // Thickness for both static and moving border

    return (
      <div
        className={cn("snake-textarea-wrapper relative p-[0px] rounded-lg overflow-hidden")} // Padding removed, handled by pseudo-elements
        style={{
          // CSS Variables for the component's theme
          ["--main-color" as string]: mainColor,
          ["--accent-color" as string]: accentColor,
          ["--static-glow-color" as string]: staticGlowColor,
          ["--snake-glow-color" as string]: snakeGlowColor,
          ["--animation-duration" as string]: animationDuration,
          ["--snake-length" as string]: snakeLength,
          ["--border-width" as string]: borderWidth,
          ["--textarea-bg" as string]: isFocused ? "#1a0c05" : "#1f1209",
          ["--textarea-text-color" as string]: isFocused ? "#ffc5ab" : "#ffdab3",
          ["--textarea-placeholder-color" as string]: isFocused
            ? "rgba(255, 218, 179, 0.6)"
            : "rgba(255, 218, 179, 0.4)",
          transition: "background-color 0.3s, color 0.3s",
        }}
      >
        {/* Static Faint Border (using ::after on the wrapper) */}
        {/* The animated snake element (using ::before on the wrapper) */}

        <Textarea
          className={cn(
            "relative z-20 w-full border-0 resize-none rounded-[calc(0.5rem-var(--border-width))]", // Inner radius adjusted for border
            "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-300 ease-in-out",
            className,
          )}
          style={
            {
              backgroundColor: "var(--textarea-bg)",
              color: "var(--textarea-text-color)",
              margin: "var(--border-width)", // Margin to sit inside the pseudo-element borders
              minHeight: props.rows ? `calc(${props.rows * 1.5}em + 1.5rem)` : undefined,
            } as React.CSSProperties
          }
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

        <style jsx>{`
          .snake-textarea-wrapper::before, /* Moving Snake */
          .snake-textarea-wrapper::after { /* Static Border */
            content: "";
            position: absolute;
            border-radius: inherit; /* Inherit from wrapper */
            pointer-events: none; /* Allow clicks to pass through */
          }

          /* Static Faint Border */
          .snake-textarea-wrapper::after {
            inset: 0;
            border: var(--border-width) solid transparent; /* Base for shadow */
            box-shadow: 0 0 8px var(--static-glow-color), inset 0 0 5px var(--static-glow-color);
            /* Optional: A very subtle border color if needed */
            /* border-color: color-mix(in srgb, var(--main-color) 20%, transparent); */
            z-index: 0;
            transition: box-shadow 0.3s ease-in-out;
          }
          
          .snake-textarea-wrapper:focus-within::after {
             box-shadow: 0 0 12px color-mix(in srgb, var(--static-glow-color) 150%, transparent), 
                         inset 0 0 8px color-mix(in srgb, var(--static-glow-color) 150%, transparent);
          }


          /* Moving Snake */
          .snake-textarea-wrapper::before {
            top: 0; /* Initial position for animation */
            left: 0;
            width: var(--snake-length);
            height: var(--border-width);
            background: linear-gradient(90deg, transparent, var(--main-color), var(--accent-color));
            box-shadow: 0 0 12px var(--snake-glow-color), 0 0 20px var(--snake-glow-color), 0 0 5px var(--main-color) inset;
            animation: moveSnake var(--animation-duration) linear infinite;
            z-index: 1; /* Above static border, below textarea */
            opacity: ${isFocused ? 1 : 0.85};
            transition: opacity 0.3s ease-in-out;
          }
          
          .snake-textarea-wrapper:focus-within::before {
            opacity: 1;
          }


          @keyframes moveSnake {
            0% { /* Top edge, left to right */
              transform: translateX(-100%);
              top: 0; left: 0; width: var(--snake-length); height: var(--border-width);
              background: linear-gradient(90deg, transparent, var(--main-color), var(--accent-color));
            }
            25% { /* End of top edge */
              transform: translateX(0%);
              top: 0; left: calc(100% - var(--snake-length)); width: var(--snake-length); height: var(--border-width);
            }
            25.0001% { /* Start of right edge, top to bottom */
              transform: translateY(-100%);
              top: 0; left: calc(100% - var(--border-width)); width: var(--border-width); height: var(--snake-length);
              background: linear-gradient(180deg, transparent, var(--main-color), var(--accent-color));
            }
            50% { /* End of right edge */
              transform: translateY(0%);
              top: calc(100% - var(--snake-length)); left: calc(100% - var(--border-width)); width: var(--border-width); height: var(--snake-length);
            }
            50.0001% { /* Start of bottom edge, right to left */
              transform: translateX(100%);
              top: calc(100% - var(--border-width)); left: calc(100% - var(--snake-length)); width: var(--snake-length); height: var(--border-width);
              background: linear-gradient(270deg, transparent, var(--main-color), var(--accent-color));
            }
            75% { /* End of bottom edge */
              transform: translateX(0%);
              top: calc(100% - var(--border-width)); left: 0; width: var(--snake-length); height: var(--border-width);
            }
            75.0001% { /* Start of left edge, bottom to top */
              transform: translateY(100%);
              top: calc(100% - var(--snake-length)); left: 0; width: var(--border-width); height: var(--snake-length);
              background: linear-gradient(0deg, transparent, var(--main-color), var(--accent-color));
            }
            100% { /* End of left edge */
              transform: translateY(0%);
              top: 0; left: 0; width: var(--border-width); height: var(--snake-length);
            }
          }
        `}</style>
      </div>
    )
  },
)

SnakeBorderTextarea.displayName = "SnakeBorderTextarea" 