"use client"

import { useRef } from "react"

interface FileUploadProps {
  label: string
  accept: string
  icon: React.ReactNode
  file?: File | null
  onFileSelect: (file: File) => void
}

export default function FileUpload({ label, accept, icon, file, onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500"
      >
        {icon}
        <p className="text-gray-400 mt-2">{file ? file.name : "Click or drag to upload"}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
    </div>
  )
}
