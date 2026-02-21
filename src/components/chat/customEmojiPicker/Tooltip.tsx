import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./tooltip.css"

type TooltipProps = {
    children: React.ReactElement;
    /** CLDR short name (e.g. "grinning face") shown in the tooltip */
    label?: string;
}

export default function Tooltip({ 
    children,
    label 
}: TooltipProps) {
    const triggerRef = useRef<HTMLDivElement>(null)
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

    const handleMouseEnter = () => {
        const el = triggerRef.current
        if (el) {
            setRect(el.getBoundingClientRect())
            setIsHovered(true)
        }
    }

    const handleMouseLeave = () => {
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
            <div
                ref={triggerRef}
                className="tooltip-children"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {tooltipContent &&
                typeof document !== "undefined" &&
                createPortal(tooltipContent, document.body)}
        </div>
    )
}
