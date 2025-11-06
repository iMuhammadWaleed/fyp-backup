import React from 'react';

interface ShareModalProps {
    url: string;
    title: string;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ url, title, onClose }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Share "{title}"</h2>
                <div className="flex items-center space-x-2">
                    <input type="text" value={url} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                    <button onClick={handleCopy} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                        Copy
                    </button>
                </div>
                <button onClick={onClose} className="mt-4 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                    Close
                </button>
            </div>
        </div>
    );
};

export default ShareModal;
