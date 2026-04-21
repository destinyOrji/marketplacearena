// Document Upload Component
import React, { useState, useRef } from 'react';
import { HiOutlineDocument, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';

export interface UploadedDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  file?: File;
  uploadedAt: Date;
}

interface DocumentUploadProps {
  documentType: string;
  label: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  existingDocument?: UploadedDocument;
  onUpload: (file: File, documentType: string) => Promise<void>;
  onRemove?: (documentId: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  label,
  description,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 5,
  existingDocument,
  onUpload,
  onRemove,
  required = false,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<UploadedDocument | undefined>(existingDocument);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isValidExtension = allowedTypes.some(type => 
      type.startsWith('.') ? fileExtension === type : mimeType.includes(type.replace('*', ''))
    );

    if (!isValidExtension) {
      return `Invalid file type. Allowed types: ${accept}`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);

    try {
      await onUpload(file, documentType);
      
      // Create temporary document object for preview
      const tempDoc: UploadedDocument = {
        id: Date.now().toString(),
        type: documentType,
        name: file.name,
        url: URL.createObjectURL(file),
        file,
        uploadedAt: new Date(),
      };
      
      setDocument(tempDoc);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (document && onRemove) {
      onRemove(document.id);
    }
    setDocument(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return document?.url;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {!document ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || uploading}
            className={`
              w-full border-2 border-dashed rounded-lg p-6 text-center
              transition-colors duration-200
              ${disabled || uploading
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              }
            `}
          >
            <HiOutlineDocument className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Click to upload'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {accept.replace(/\./g, '').toUpperCase()} up to {maxSizeMB}MB
            </p>
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-start space-x-3">
            {getFileIcon(document.name) ? (
              <img
                src={document.url}
                alt={document.name}
                className="h-16 w-16 object-cover rounded"
              />
            ) : (
              <HiOutlineDocument className="h-16 w-16 text-gray-400 flex-shrink-0" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {document.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded {document.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
                
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove document"
                  >
                    <HiOutlineXMark className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <div className="mt-2 flex items-center text-xs text-green-600">
                <HiOutlineCheckCircle className="h-4 w-4 mr-1" />
                <span>Uploaded successfully</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <HiOutlineExclamationCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
