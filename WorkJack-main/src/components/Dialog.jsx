import React from 'react';

const Dialog = ({ open, onClose, title, content }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="mb-4">{content}</p>
        <button 
          onClick={onClose} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}

export default Dialog;