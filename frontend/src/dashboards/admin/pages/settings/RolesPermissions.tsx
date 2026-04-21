import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Button, Modal, Input } from '../../components';
import { settingsService } from '../../services/settingsService';
import { Role } from '../../types';

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [createModal, setCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });

  const availablePermissions = [
    'view_patients', 'edit_patients', 'delete_patients',
    'view_professionals', 'edit_professionals', 'verify_professionals',
    'view_hospitals', 'edit_hospitals', 'verify_hospitals',
    'view_ambulances', 'edit_ambulances', 'verify_ambulances',
    'manage_settings', 'view_audit_logs', 'manage_admins'
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const data = await settingsService.getRoles();
    setRoles(data);
  };

  const handleCreate = async () => {
    try {
      await settingsService.createRole(newRole);
      setCreateModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
      fetchRoles();
      alert('Role created successfully');
    } catch (error) {
      alert('Failed to create role');
    }
  };

  const togglePermission = (permission: string) => {
    setNewRole({
      ...newRole,
      permissions: newRole.permissions.includes(permission)
        ? newRole.permissions.filter(p => p !== permission)
        : [...newRole.permissions, permission]
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateModal(true)}>
          <FiPlus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{role.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{role.description}</p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.map((perm) => (
                <span key={perm} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Role">
        <div className="space-y-4">
          <Input label="Role Name" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} />
          <Input label="Description" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {availablePermissions.map((perm) => (
                <label key={perm} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newRole.permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="rounded"
                  />
                  <span className="text-sm">{perm.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesPermissions;
