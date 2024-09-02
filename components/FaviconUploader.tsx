"use client";

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const FaviconUploader: React.FC = () => {
  const [favicon, setFavicon] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFavicon(result);
        updateFavicon(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFavicon = (dataUrl: string) => {
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = dataUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  const downloadFavicon = (format: string, size: number, filename: string) => {
    if (favicon) {
      const img = new Image();
      img.src = favicon;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], filename, { type: `image/${format}` });
              saveAs(file);
            }
          }, `image/${format}`);
        }
      };
    }
  };

  const downloadAll = async () => {
    if (favicon) {
      const zip = new JSZip();
      const img = new Image();
      img.src = favicon;
      img.onload = async () => {
        const sizes = [
          { size: 16, format: 'ico', filename: 'favicon.ico' },
          { size: 32, format: 'png', filename: 'favicon32.png' },
          { size: 64, format: 'png', filename: 'favicon64.png' },
          { size: 128, format: 'png', filename: 'favicon128.png' },
        ];

        const promises = sizes.map(({ size, format, filename }) => {
          return new Promise<void>((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, size, size);
              canvas.toBlob((blob) => {
                if (blob) {
                  zip.file(filename, blob);
                  resolve();
                }
              }, `image/${format}`);
            }
          });
        });

        await Promise.all(promises);
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'favicons.zip');
      };
    }
  };

  const handleDelete = () => {
    setFavicon(null);
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (link) {
      link.href = '/favicon.ico';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-red-500 text-white">
      <h1 className="text-4xl font-bold mb-4">Favicon 변경기</h1>
      {!favicon && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="mb-4 p-2 border border-gray-300 rounded bg-white text-black transition duration-300 ease-in-out transform hover:scale-105"
        />
      )}
      {favicon && (
        <>
          <img src={favicon} alt="New Favicon" className="w-16 h-16 border border-gray-300" />
          <div className="mt-4 flex flex-col items-center">
            <button
              onClick={() => downloadFavicon('ico', 16, 'favicon.ico')}
              className="mb-2 px-4 py-2 bg-blue-500 text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              다운로드 (ICO, 16x16)
            </button>
            <button
              onClick={() => downloadFavicon('png', 32, 'favicon32.png')}
              className="mb-2 px-4 py-2 bg-blue-500 text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              다운로드 (PNG, 32x32)
            </button>
            <button
              onClick={() => downloadFavicon('png', 64, 'favicon64.png')}
              className="mb-2 px-4 py-2 bg-blue-500 text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              다운로드 (PNG, 64x64)
            </button>
            <button
              onClick={() => downloadFavicon('png', 128, 'favicon128.png')}
              className="mb-2 px-4 py-2 bg-blue-500 text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              다운로드 (PNG, 128x128)
            </button>
            <button
              onClick={downloadAll}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              전체 다운로드 (ZIP)
            </button>
            <button
              onClick={handleDelete}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FaviconUploader;
