"use client";

import { useState, useRef, ChangeEvent, MouseEvent, useEffect } from "react";
import Image from "next/image";

interface ExistingImage {
  url: string;
  name?: string;
  id?: string;
}

interface MultipleImageUploadProps {
  name?: string;
  maxFiles?: number | null;
  maxSizeBytes?: number | null;
  allowedTypes?: string[] | null;
  onChange?: (files: File[], existingImages: ExistingImage[]) => void;
  className?: string;
  existingImages?: ExistingImage[];
  onExistingImageRemove?: (
    imageId: string | undefined,
    imageUrl: string
  ) => Promise<void>;
}

export default function MultipleImageUpload({
  name = "images",
  maxFiles = null,
  maxSizeBytes = null,
  allowedTypes = null,
  onChange,
  className = "",
  existingImages = [],
  onExistingImageRemove,
}: MultipleImageUploadProps): JSX.Element {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImageList, setExistingImageList] =
    useState<ExistingImage[]>(existingImages);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExistingImageList(existingImages);
  }, [existingImages]);

  useEffect(() => {
    if (maxFiles !== null) {
      const totalCount = selectedImages.length + existingImageList.length;
      if (totalCount > maxFiles) {
        setErrors([
          `Total images (${totalCount}) exceeds maximum of ${maxFiles}`,
        ]);
      } else {
        setErrors([]);
      }
    }
  }, [selectedImages, existingImageList, maxFiles]);

  const validateFile = (file: File): boolean => {
    const newErrors: string[] = [];

    if (maxSizeBytes !== null && file.size > maxSizeBytes) {
      newErrors.push(
        `File "${file.name}" exceeds maximum size of ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB`
      );
    }

    if (allowedTypes !== null && !allowedTypes.includes(file.type)) {
      newErrors.push(
        `File "${file.name}" is not an allowed type. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    if (newErrors.length > 0) {
      setErrors((prev) => [...prev, ...newErrors]);
      return false;
    }

    return true;
  };

  const handleImageSelection = (e: ChangeEvent<HTMLInputElement>): void => {
    setErrors([]);
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (
      maxFiles !== null &&
      selectedImages.length + existingImageList.length + files.length > maxFiles
    ) {
      setErrors([`You can only upload a maximum of ${maxFiles} files`]);
      return;
    }

    const validFiles = files.filter(validateFile);

    if (validFiles.length === 0) return;

    const newSelectedImages = [...selectedImages, ...validFiles];
    setSelectedImages(newSelectedImages);

    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);

    if (onChange) {
      onChange(newSelectedImages, existingImageList);
    }
  };

  const removeImage = (index: number): void => {
    const dt = new DataTransfer();

    selectedImages.forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }

    URL.revokeObjectURL(previewUrls[index]);

    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

    setSelectedImages(newSelectedImages);
    setPreviewUrls(newPreviewUrls);

    if (onChange) {
      onChange(newSelectedImages, existingImageList);
    }
  };

  const removeExistingImage = async (index: number): Promise<void> => {
    const imageToRemove = existingImageList[index];
  
    const newExistingImages = existingImageList.filter((_, i) => i !== index);
    setExistingImageList(newExistingImages); // State update
  
    console.log("Removing image:", imageToRemove.url); // Debug log
  
    try {
      if (onExistingImageRemove && imageToRemove) {
        await onExistingImageRemove(imageToRemove.id, imageToRemove.url); // Await deletion
        console.log("Image removed successfully:", imageToRemove.url); // Debug log
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      setExistingImageList(existingImageList); // Revert state update
      return;
    }
  
    if (onChange) {
      onChange(selectedImages, newExistingImages); // Now runs after deletion
    }
  };

  const handleSelectClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearNewImages = (): void => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSelectedImages([]);
    setPreviewUrls([]);

    if (onChange) {
      onChange([], existingImageList);
    }
  };

  const getFilenameFromUrl = (url: string): string => {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      return pathname.substring(pathname.lastIndexOf("/") + 1);
    } catch {
      return "image";
    }
  };

  const totalImageCount = selectedImages.length + existingImageList.length;

  const isMaxFilesReached = maxFiles !== null && totalImageCount >= maxFiles;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <label
          htmlFor={`${name}-upload`}
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Upload Images
          {maxFiles !== null && (
            <span className="text-xs text-gray-500 ml-2">
              ({totalImageCount}/{maxFiles})
            </span>
          )}
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectClick}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isMaxFilesReached}
          >
            Select Images
          </button>

          {selectedImages.length > 0 && (
            <button
              type="button"
              onClick={clearNewImages}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear New Images
            </button>
          )}

          <span className="text-sm text-gray-500">
            {totalImageCount} {totalImageCount === 1 ? "image" : "images"} total
          </span>
        </div>

        {/* File input - hidden but functional */}
        <input
          ref={fileInputRef}
          id={`${name}-upload`}
          type="file"
          name={name}
          accept="image/*"
          multiple
          onChange={handleImageSelection}
          className="hidden"
          aria-label="Upload images"
        />

        {/* Hidden inputs for existing image IDs */}
        {existingImageList.map((image, index) => (
          <input
            key={`existing-${index}`}
            type="hidden"
            name={`${name}-existing-ids`}
            value={image.id || ""}
          />
        ))}
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800 mb-1">
            Please correct the following:
          </p>
          <ul className="list-disc list-inside text-xs text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview of existing images */}
      {existingImageList.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Existing Images
          </h3>
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            role="list"
          >
            {existingImageList.map((image, index) => (
              <li
                key={`existing-${index}`}
                className="relative border rounded-md overflow-hidden"
              >
                <div className="relative w-full pt-[100%]">
                  <Image
                    src={image.url}
                    alt={`Existing image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => await removeExistingImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                  aria-label={`Remove existing image ${index + 1}`}
                >
                  ×
                </button>
                <div className="p-1 text-xs text-gray-500 truncate">
                  {image.name || getFilenameFromUrl(image.url)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview of newly selected images */}
      {previewUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Newly Selected Images
          </h3>
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            role="list"
          >
            {previewUrls.map((url, index) => (
              <li
                key={`new-${index}`}
                className="relative border rounded-md overflow-hidden"
              >
                <div className="relative w-full pt-[100%]">
                  <Image
                    src={url}
                    alt={`Selected image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
                </button>
                <div className="p-1 text-xs text-gray-500 truncate">
                  {selectedImages[index]?.name || "Image file"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
