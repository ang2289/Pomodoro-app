export type ImageFitMode = 'contain' | 'cover'

export type ImagePlacement = {
  drawWidth: number
  drawHeight: number
  offsetX: number
  offsetY: number
  scale: number
}

export function calculateImagePlacement(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  mode: ImageFitMode
): ImagePlacement {
  const scale =
    mode === 'contain'
      ? Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight)
      : Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)

  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  const offsetX = (targetWidth - drawWidth) / 2
  const offsetY = (targetHeight - drawHeight) / 2

  return {
    drawWidth,
    drawHeight,
    offsetX,
    offsetY,
    scale,
  }
}

type RenderImageToCanvasParams = {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  targetWidth: number
  targetHeight: number
  mode: ImageFitMode
  backgroundColor?: string
}

export function renderImageToCanvas({
  canvas,
  image,
  targetWidth,
  targetHeight,
  mode,
  backgroundColor = '#f3f4f6',
}: RenderImageToCanvasParams): ImagePlacement | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const placement = calculateImagePlacement(
    image.naturalWidth,
    image.naturalHeight,
    targetWidth,
    targetHeight,
    mode
  )

  canvas.width = targetWidth
  canvas.height = targetHeight
  ctx.clearRect(0, 0, targetWidth, targetHeight)
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, targetWidth, targetHeight)
  ctx.drawImage(image, placement.offsetX, placement.offsetY, placement.drawWidth, placement.drawHeight)

  return placement
}
