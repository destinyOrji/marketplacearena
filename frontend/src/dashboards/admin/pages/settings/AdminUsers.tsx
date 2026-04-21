import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Button, Modal, Input } from '../../components';
import { settingsService } from '../../services/settingsService';
import { AdminUser } from '../../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: AdminUser | null }>({ show: false, user: null });
  const [newUser, setNewUser] = useState({ email: '', first_name: '', last_name: '', password: '', role: 'admin' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await settingsService.getAdminUsers();
    setUsers(data);
  };

  const handleCreate = async () => {
    try {
      await settingsService.createAdminUser(newUser);
      setCreateModal(false);
      setNewUser({ email: '', first_name: '', last_name: '', password: '', role: 'admin' });
      fetchUsers();
      alert('Admin user created successfully');
    } catch (error) {
      alert('Failed to create admin user');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    try {
      await settingsService.deleteAdminUser(deleteModal.user.id);
      setDeleteModal({ show: false, user: null });
      fetchUsers();
    } catch (error) {
      alert('Failed to delete admin user');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateModal(true)}>
          <FiPlus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => setDeleteModal({ show: true, user })} className="text-red-600 hover:text-red-800">
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Admin User">
        <div className="space-y-4">
          <Input label="First Name" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
          <Input label="Last Name" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
          <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <Input label="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, user: null })} title="Delete Admin User">
        <div className="space-y-4">
          <p>Are you sure you want to delete <strong>{deleteModal.user?.first_name} {deleteModal.user?.last_name}</strong>?</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setDeleteModal({ show: false, user: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
