"use client";

import { useState, useRef } from "react";
import { IconUpload, IconX } from "@tabler/icons-react";

const MediaUploader = ({ value, onChange, className }) => {
  const [preview, setPreview] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center ${
          isDragging
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-green-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="media-upload"
        />

        {preview ? (
          <div className="relative">
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <IconX size={16} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="media-upload"
            className="cursor-pointer flex flex-col items-center justify-center py-6"
          >
            <IconUpload
              size={32}
              className="text-gray-400 mb-2 hover:text-green-500 transition-colors"
            />
            <p className="text-sm text-gray-600">
              Fotoğraf yüklemek için tıklayın veya sürükleyin
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG veya GIF (max. 2MB)
            </p>
          </label>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
