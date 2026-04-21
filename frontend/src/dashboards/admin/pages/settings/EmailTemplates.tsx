import React, { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import { Button, Modal, Input } from '../../components';
import { settingsService } from '../../services/settingsService';
import { EmailTemplate } from '../../types';

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const data = await settingsService.getEmailTemplates();
    setTemplates(data);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    try {
      await settingsService.updateEmailTemplate(selectedTemplate.id, selectedTemplate);
      setEditModal(false);
      fetchTemplates();
      alert('Template updated successfully');
    } catch (error) {
      alert('Failed to update template');
    }
  };

  const handleTestSend = async () => {
    if (!selectedTemplate || !testEmail) return;
    try {
      await settingsService.testEmailTemplate(selectedTemplate.id, testEmail);
      alert('Test email sent successfully');
    } catch (error) {
      alert('Failed to send test email');
    }
  };

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div key={template.id} className="border rounded-lg p-4 flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.subject}</p>
            <p className="text-xs text-gray-500 mt-1">Variables: {template.variables.join(', ')}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => handleEdit(template)}>
            <FiEdit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      ))}

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Email Template">
        {selectedTemplate && (
          <div className="space-y-4">
            <Input
              label="Subject"
              value={selectedTemplate.subject}
              onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                value={selectedTemplate.body}
                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={10}
              />
            </div>
            <div>
              <Input
                label="Test Email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to send test"
              />
              <Button size="sm" variant="secondary" onClick={handleTestSend} className="mt-2">
                Send Test Email
              </Button>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailTemplates;
