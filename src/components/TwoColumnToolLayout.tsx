import React from 'react'

interface TwoColumnToolLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

export default function TwoColumnToolLayout({
  left,
  right,
}: TwoColumnToolLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">{left}</div>
        <div className="space-y-4">{right}</div>
      </div>
    </div>
  )
}

