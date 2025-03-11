import { useState } from "react";

export default function ImageUploader() {
  const [images, setImages] = useState<string[]>([]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <label className="block mb-2 font-semibold">Upload Images:</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4 w-full border p-2 rounded"
      />

      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((src, index) => (
            <li key={index} className="flex items-center gap-2">
              <img
                src={src}
                alt={`Preview ${index}`}
                className="w-16 h-16 object-cover rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
