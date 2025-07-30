'use client';
import { useState } from 'react';
import axios from 'axios';

export default function UploadInput({ label, onUploaded, accept = 'image/*,video/*' }) {
  const [previews, setPreviews] = useState([]); // Lưu danh sách preview
  const [uploading, setUploading] = useState(false);

  const buildUrl = (path) =>
    path.startsWith('http')
      ? path
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const tooLarge = files.some(file => file.size > 5 * 1024 * 1024);
    if (tooLarge) {
      alert('One or more files exceed 5MB.');
      return;
    }

    setPreviews(files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video'
    })));

    setUploading(true);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const apiURL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`;
      const res = await axios.post(apiURL, formData);

      // Backend trả về { urls: [..] }
      const urls = res.data.urls.map(buildUrl);
      onUploaded(urls); // Trả mảng URL về cho cha
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium">{label}</label>
      <input
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="block"
      />

      {/* Preview các file */}
      <div className="flex flex-wrap gap-2">
        {previews.map((file, idx) => (
          file.type === 'image' ? (
            <img key={idx} src={file.url} alt={`Preview ${idx + 1}`} className="h-24 rounded shadow border" />
          ) : (
            <video key={idx} src={file.url} controls className="h-24 rounded shadow border" />
          )
        ))}
      </div>

      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
    </div>
  );
}
