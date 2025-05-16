"use client"

import { useEffect, useRef } from "react"

interface CompositeTokenIconProps {
  icons: string[]
  size?: number
  name: string
  className?: string
}

export function CompositeTokenIcon({ icons, size = 32, name, className = "" }: CompositeTokenIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Default icons to use if none provided
  const defaultIcons = ["/polymarket-logo.png", "/kalshi-logo.png", "/manifold-markets-logo.png", "/metaculus-logo.png"]

  // Use provided icons or defaults
  const iconSources =
    icons && icons.length > 0 && icons.some((icon) => icon) ? icons.filter((icon) => icon) : defaultIcons

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw background circle
    ctx.fillStyle = "#1e293b"
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Load and draw icons
    const loadAndDrawIcons = async () => {
      // Limit to 4 icons maximum
      const iconsToRender = iconSources.slice(0, 4)

      // Calculate positions based on number of icons
      const positions = getIconPositions(iconsToRender.length, size)

      // Load all images first
      const images = await Promise.all(iconsToRender.map((src) => loadImage(src)))

      // Draw each image
      images.forEach((img, index) => {
        if (!img) return

        const pos = positions[index]
        const iconSize = pos.size

        // Create circular clipping path
        ctx.save()
        ctx.beginPath()
        ctx.arc(pos.x + iconSize / 2, pos.y + iconSize / 2, iconSize / 2, 0, Math.PI * 2)
        ctx.clip()

        // Draw the image
        ctx.drawImage(img, pos.x, pos.y, iconSize, iconSize)

        // Draw border
        ctx.strokeStyle = "#1e293b"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pos.x + iconSize / 2, pos.y + iconSize / 2, iconSize / 2, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      })

      // Draw outer ring
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2)
      ctx.stroke()
    }

    loadAndDrawIcons()
  }, [icons, size, iconSources])

  // Helper function to load an image
  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null)
        return
      }

      const img = new Image()
      img.crossOrigin = "anonymous" // Prevent CORS issues

      img.onload = () => resolve(img)
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`)
        resolve(null)
      }

      img.src = src
    })
  }

  // Calculate positions for icons based on count
  const getIconPositions = (count: number, containerSize: number) => {
    const positions = []
    const padding = 2

    switch (count) {
      case 1:
        // Single icon centered
        const singleSize = containerSize - padding * 2
        positions.push({
          x: padding,
          y: padding,
          size: singleSize,
        })
        break

      case 2:
        // Two icons side by side
        const twoSize = containerSize / 2 - padding
        positions.push(
          { x: padding, y: containerSize / 4, size: twoSize },
          { x: containerSize / 2, y: containerSize / 4, size: twoSize },
        )
        break

      case 3:
        // One on top, two on bottom
        const threeSize = containerSize / 2 - padding
        positions.push(
          { x: containerSize / 4, y: padding, size: threeSize },
          { x: padding, y: containerSize / 2, size: threeSize },
          { x: containerSize / 2, y: containerSize / 2, size: threeSize },
        )
        break

      case 4:
      default:
        // Four icons in a grid
        const fourSize = containerSize / 2 - padding
        positions.push(
          { x: padding, y: padding, size: fourSize },
          { x: containerSize / 2, y: padding, size: fourSize },
          { x: padding, y: containerSize / 2, size: fourSize },
          { x: containerSize / 2, y: containerSize / 2, size: fourSize },
        )
        break
    }

    return positions
  }

  return <canvas ref={canvasRef} width={size} height={size} className={`rounded-full ${className}`} title={name} />
}
