// ServiceFormModal component for creating and editing services

import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { serviceSchema, formatValidationErrors } from '../utils/validation';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Service>, images: File[]) => Promise<void>;
  service?: Service | null;
  mode: 'create' | 'edit';
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  service,
  mode,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    duration: 30,
    consultationType: [] as ('in-person' | 'virtual' | 'home-visit')[],
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service && mode === 'edit') {
      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        consultationType: service.consultationType,
      });
      setImagePreviews(service.images || []);
    }
  }, [service, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleConsultationTypeToggle = (type: 'in-person' | 'virtual' | 'home-visit') => {
    const current = formData.consultationType;
    if (current.includes(type)) {
      handleInputChange('consultationType', current.filter(t => t !== type));
    } else {
      handleInputChange('consultationType', [...current, type]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files.length);
    
    const validImages = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      console.log(`File ${file.name}: valid=${isValid}, size=${file.size}, under5MB=${isUnder5MB}`);
      return isValid && isUnder5MB;
    });

    console.log('Valid images:', validImages.length);

    if (validImages.length !== files.length) {
      setErrors({ ...errors, images: 'Some files were invalid. Only images under 5MB are allowed.' });
    }

    setImages([...images, ...validImages]);
    console.log('Total images after adding:', [...images, ...validImages].length);
    
    // Create previews
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    console.log('=== Form Submit ===');
    console.log('Form data:', formData);
    console.log('Images:', images.length);
    console.log('Image previews:', imagePreviews.length);

    // Validate form data
    const validationResult = serviceSchema.safeParse(formData);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error);
      setErrors(formatValidationErrors(validationResult.error));
      return;
    }

    setLoading(true);
    try {
      console.log('Calling onSubmit with images:', images);
      await onSubmit(formData, images);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        price: 0,
        duration: 30,
        consultationType: [],
      });
      setImages([]);
      setImagePreviews([]);
    } catch (error: any) {
      console.error('Submit error:', error);
      setErrors({ submit: error.message || 'Failed to save service' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-form-title"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 id="service-form-title" className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Service' : 'Edit Service'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="service-title" className="block text-sm font-medium text-gray-700 mb-1">
              Service Title *
            </label>
            <input
              id="service-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., General Consultation"
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && <p id="title-error" className="text-red-600 text-sm mt-1" role="alert">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="service-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="service-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your service in detail..."
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && <p id="description-error" className="text-red-600 text-sm mt-1" role="alert">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="service-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="service-category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-required="true"
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">Select a category</option>
              <option value="consultation">Consultation</option>
              <option value="procedure">Procedure</option>
              <option value="therapy">Therapy</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <p id="category-error" className="text-red-600 text-sm mt-1" role="alert">{errors.category}</p>}
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultation Type *
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'in-person', label: 'In-Person' },
                { value: 'virtual', label: 'Virtual' },
                { value: 'home-visit', label: 'Home Visit' },
              ].map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.consultationType.includes(type.value as any)}
                    onChange={() => handleConsultationTypeToggle(type.value as any)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            {errors.consultationType && <p className="text-red-600 text-sm mt-1">{errors.consultationType}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Images (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="service-images"
            />
            <label
              htmlFor="service-images"
              className="block w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-600 hover:border-blue-500 hover:text-blue-600 cursor-pointer"
            >
              + Add Images
            </label>
            {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 bg-white flex justify-end gap-3 pt-4 pb-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Service' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
