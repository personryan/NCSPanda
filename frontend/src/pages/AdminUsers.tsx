import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AdminUser,
  fetchAdminUsers,
  softDeleteAdminUser,
  updateAdminUser,
} from '../services/api';

const roleOptions = [
  { id: 1, label: 'Customer' },
  { id: 2, label: 'Vendor' },
  { id: 3, label: 'Admin' },
];

interface AdminUsersPageProps {
  accessToken: string;
}

interface UserFormState {
  user_id: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_active: boolean;
}

const emptyForm: UserFormState = {
  user_id: '',
  first_name: '',
  last_name: '',
  role_id: 1,
  is_active: true,
};

function toFormState(user: AdminUser): UserFormState {
  return {
    user_id: user.user_id,
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    role_id: user.role_id,
    is_active: user.is_active,
  };
}

export default function AdminUsersPage({ accessToken }: AdminUsersPageProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeCount = useMemo(() => users.filter((user) => user.is_active).length, [users]);

  const loadUsers = () => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchAdminUsers(accessToken)
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load users');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  };

  useEffect(() => loadUsers(), [accessToken]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingUserId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUserId) {
        const updated = await updateAdminUser(accessToken, editingUserId, {
          first_name: form.first_name,
          last_name: form.last_name,
          role_id: form.role_id,
          is_active: form.is_active,
        });
        setUsers((current) => current.map((user) => (user.user_id === updated.user_id ? updated : user)));
        setSuccess('User updated.');
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (userId: string) => {
    setError(null);
    setSuccess(null);
    try {
      const updated = await softDeleteAdminUser(accessToken, userId);
      setUsers((current) => current.map((user) => (user.user_id === userId ? updated : user)));
      setSuccess('User deactivated.');
      if (editingUserId === userId) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  return (
    <section className="menu-page">
      <div className="menu-page-header">
        <h1>User Management</h1>
        <p>Update existing user profiles and deactivate users without deleting records.</p>
      </div>

      <div className="vendor-summary-cards admin-summary-cards">
        <article className="vendor-card"><h3>Total Users</h3><strong>{users.length}</strong></article>
        <article className="vendor-card"><h3>Active Users</h3><strong>{activeCount}</strong></article>
        <article className="vendor-card"><h3>Inactive Users</h3><strong>{users.length - activeCount}</strong></article>
      </div>

      <div className="admin-layout">
        <form className="menu-surface admin-user-form" onSubmit={handleSubmit}>
          <h2>{editingUserId ? 'Update User' : 'Select User'}</h2>
          <div className="form-group">
            <label htmlFor="admin-user-id" className="form-label">User ID</label>
            <input
              id="admin-user-id"
              className="form-input"
              value={form.user_id}
              disabled
            />
          </div>
          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="admin-first-name" className="form-label">First name</label>
              <input
              id="admin-first-name"
              className="form-input"
              value={form.first_name}
              onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))}
              disabled={!editingUserId || saving}
            />
            </div>
            <div className="form-group">
              <label htmlFor="admin-last-name" className="form-label">Last name</label>
              <input
              id="admin-last-name"
              className="form-input"
              value={form.last_name}
              onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))}
              disabled={!editingUserId || saving}
            />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="admin-role" className="form-label">Role</label>
            <select
              id="admin-role"
              className="form-input"
              value={form.role_id}
              onChange={(e) => setForm((current) => ({ ...current, role_id: Number(e.target.value) }))}
              disabled={!editingUserId || saving}
            >
              {roleOptions.map((role) => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((current) => ({ ...current, is_active: e.target.checked }))}
              disabled={!editingUserId || saving}
            />
            Active profile
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary btn-inline" disabled={saving || !editingUserId}>
              {saving ? 'Saving...' : 'Update User'}
            </button>
            {editingUserId ? (
              <button type="button" className="btn btn-ghost btn-inline" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
          {error ? <p className="alert-error">{error}</p> : null}
          {success ? <p className="success-note">{success}</p> : null}
        </form>

        <div className="menu-surface">
          {loading ? <p>Loading users...</p> : null}
          {!loading && users.length === 0 ? <p className="menu-empty">No users found.</p> : null}
          {!loading && users.length > 0 ? (
            <div className="table-wrap">
              <table className="vendor-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>User ID</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{[user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unnamed'}</td>
                      <td>{user.user_id}</td>
                      <td>{user.role?.role_name ?? roleOptions.find((role) => role.id === user.role_id)?.label}</td>
                      <td>
                        <span className={`status-pill ${user.is_active ? 'status-available' : 'status-sold_out'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="btn btn-ghost btn-inline"
                            onClick={() => {
                              setForm(toFormState(user));
                              setEditingUserId(user.user_id);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-inline"
                            onClick={() => handleSoftDelete(user.user_id)}
                            disabled={!user.is_active}
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
