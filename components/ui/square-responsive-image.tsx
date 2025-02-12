import Image, { StaticImageData } from "next/image"

interface SquareResponsiveImageProps {
  src: string | StaticImageData
  alt: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function SquareResponsiveImage({ src, alt, size = "md", className = "" }: SquareResponsiveImageProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32 sm:w-48 sm:h-48",
    lg: "w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96",
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover rounded-lg"
      />
    </div>
  )
}