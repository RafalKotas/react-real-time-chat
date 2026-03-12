import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./tooltip.css"

type TooltipProps = {
    children: React.ReactElement;
    label?: string;
}

export default function Tooltip({
    children,
    label,
}: Readonly<TooltipProps>) {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        if (!isHovered) return
        let rafId: number
        const updatePosition = () => {
            const el = triggerRef.current
            if (el) {
                const next = el.getBoundingClientRect()
                setRect((prev) =>
                    prev &&
                    prev.left === next.left &&
                    prev.top === next.top &&
                    prev.width === next.width &&
                    prev.height === next.height
                        ? prev
                        : next
                )
            }
            rafId = requestAnimationFrame(updatePosition)
        }
        rafId = requestAnimationFrame(updatePosition)
        return () => cancelAnimationFrame(rafId)
    }, [isHovered])

    const showTooltip = () => {
        const el = triggerRef.current
        if (el) {
            setRect(el.getBoundingClientRect())
            setIsHovered(true)
        }
    }

    const hideTooltip = () => {
        setIsHovered(false)
        setRect(null)
    }

    const tooltipContent = isHovered && rect && (
        <div
            className="tooltip tooltip--portal"
            style={{
                left: rect.left + rect.width / 2,
                top: rect.top,
                transform: "translate(-50%, calc(-100% - 8px))",
            }}
        >
            <span>{label ?? "Emoji"}</span>
        </div>
    )

    return (
        <div className="tooltip-container">
            <button
                type="button"
                ref={triggerRef}
                aria-label={label ?? "Emoji"}
                className="tooltip-children"
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
            >
                {children}
            </button>
            {tooltipContent &&
                typeof document !== "undefined" &&
                createPortal(tooltipContent, document.body)}
        </div>
    )
}
