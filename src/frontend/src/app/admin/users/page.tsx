'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit, Trash2, ShieldCheck, 
  UserCheck, UserX, AlertCircle, X, CheckCircle2, Lock, Mail, User
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface UserItem {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

interface RoleItem {
  id: number;
  name: string;
  description: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([
    { id: 1, name: 'Admin', description: 'Quản trị viên toàn quyền hệ thống' },
    { id: 2, name: 'Editor', description: 'Biên tập viên nội dung' },
    { id: 3, name: 'Customer', description: 'Khách hàng người dùng hệ thống' },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRoleId, setFormRoleId] = useState<number>(3); // Mặc định Customer
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formPassword, setFormPassword] = useState('');

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Load Roles
      const roleRes = await fetchApi<RoleItem[]>('/api/Users/roles');
      if (roleRes.data && Array.isArray(roleRes.data) && roleRes.data.length > 0) {
        setRoles(roleRes.data);
      }

      // 2. Load Users
      const userRes = await fetchApi<UserItem[]>('/api/Users');
      if (userRes.data && Array.isArray(userRes.data)) {
        setUsers(userRes.data);
      } else {
        // Fallback default sample data nếu chưa có backend data
        setUsers([
          {
            id: 1,
            username: 'admin',
            email: 'admin@cloudservice.vn',
            fullName: 'Quản trị viên hệ thống',
            roleId: 1,
            roleName: 'Admin',
            isActive: true,
            createdAt: '2026-08-01T08:00:00Z',
          },
          {
            id: 2,
            username: 'editor',
            email: 'editor@cloudservice.vn',
            fullName: 'Biên tập viên nội dung',
            roleId: 2,
            roleName: 'Editor',
            isActive: true,
            createdAt: '2026-08-05T09:30:00Z',
          },
          {
            id: 3,
            username: 'nguyenphuongkiet',
            email: 'kiet.np@domain.vn',
            fullName: 'Nguyễn Phương Kiệt',
            roleId: 3,
            roleName: 'Customer',
            isActive: true,
            createdAt: '2026-08-10T14:20:00Z',
          }
        ]);
      }
    } catch {
      setErrorMsg('Không thể tải danh sách tài khoản từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (user?: UserItem) => {
    setMessage(null);
    setErrorMsg(null);
    if (user) {
      setEditingUser(user);
      setFormUsername(user.username);
      setFormEmail(user.email);
      setFormFullName(user.fullName);
      setFormRoleId(user.roleId);
      setFormIsActive(user.isActive);
      setFormPassword('');
    } else {
      setEditingUser(null);
      setFormUsername('');
      setFormEmail('');
      setFormFullName('');
      setFormRoleId(roles[roles.length - 1]?.id || 3);
      setFormIsActive(true);
      setFormPassword('');
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);

    // Validation họ tên
    const nameClean = formFullName.trim();
    const nameRegex = /^[\p{L}\s]{2,50}$/u;
    if (!nameRegex.test(nameClean)) {
      setErrorMsg('Họ và tên chỉ được chứa chữ cái và khoảng trắng (từ 2 đến 50 ký tự).');
      return;
    }

    // Validation email
    const emailClean = formEmail.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailClean)) {
      setErrorMsg('Địa chỉ email không đúng định dạng (vd: user@domain.com).');
      return;
    }

    // Validation username khi tạo mới
    if (!editingUser) {
      const userClean = formUsername.trim();
      const userRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!userRegex.test(userClean)) {
        setErrorMsg('Tên đăng nhập phải từ 3 đến 20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới (_).');
        return;
      }

      if (!formPassword || formPassword.length < 6) {
        setErrorMsg('Mật khẩu khởi tạo phải có tối thiểu 6 ký tự.');
        return;
      }
    } else {
      if (formPassword && formPassword.length < 6) {
        setErrorMsg('Mật khẩu mới nếu nhập phải có tối thiểu 6 ký tự.');
        return;
      }
    }

    try {
      if (editingUser) {
        // Cập nhật người dùng
        const res = await fetchApi<UserItem>(`/api/Users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            email: emailClean,
            fullName: nameClean,
            roleId: formRoleId,
            isActive: formIsActive,
            newPassword: formPassword.trim() ? formPassword : null,
          }),
        });

        if (res.error) {
          setErrorMsg(res.error);
          return;
        }

        setMessage(`Cập nhật tài khoản "${editingUser.username}" thành công.`);
      } else {
        // Tạo người dùng mới
        const res = await fetchApi<UserItem>('/api/Users', {
          method: 'POST',
          body: JSON.stringify({
            username: formUsername.trim(),
            email: emailClean,
            password: formPassword,
            fullName: nameClean,
            roleId: formRoleId,
            isActive: formIsActive,
          }),
        });

        if (res.error) {
          setErrorMsg(res.error);
          return;
        }

        setMessage(`Tạo tài khoản người dùng "${formUsername.trim()}" thành công.`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch {
      setErrorMsg('Đã xảy ra lỗi khi lưu thông tin người dùng.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetchApi(`/api/Users/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setMessage(`Đã xóa tài khoản "${deleteTarget.username}" thành công.`);
        await loadData();
      }
    } catch {
      setErrorMsg('Không thể xóa tài khoản này.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Lọc danh sách
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = roleFilter === 'ALL' || u.roleName === roleFilter;

    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Quản Lý Người Dùng & Phân Quyền</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh sách tài khoản khách hàng, biên tập viên và quản trị viên hệ thống
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-pill btn-pill-primary text-xs py-3 px-5 flex items-center gap-2 font-bold shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Thêm Tài Khoản Mới
        </button>
      </div>

      {/* Thông báo Alert */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          {errorMsg}
        </div>
      )}

      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo username, email, họ tên..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Vai trò:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Tất Cả Vai Trò</option>
            <option value="Admin">Quản Trị Viên (Admin)</option>
            <option value="Editor">Biên Tập Viên (Editor)</option>
            <option value="Customer">Khách Hàng (Customer)</option>
          </select>
        </div>
      </div>

      {/* Bảng Danh Sách Người Dùng */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Tài Khoản & Họ Tên</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Vai Trò (Role)</th>
                <th className="py-4 px-6">Trạng Thái</th>
                <th className="py-4 px-6">Ngày Tạo</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy tài khoản nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadgeClass =
                    u.roleName === 'Admin'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : u.roleName === 'Editor'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono text-slate-400">#{u.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.username}</p>
                            <p className="text-[11px] text-slate-500">{u.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${roleBadgeClass}`}>
                          {u.roleName === 'Admin'
                            ? 'Quản Trị Viên'
                            : u.roleName === 'Editor'
                            ? 'Biên Tập Viên'
                            : 'Khách Hàng'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <UserCheck className="w-3.5 h-3.5" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <UserX className="w-3.5 h-3.5" /> Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Sửa tài khoản"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA NGƯỜI DÙNG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                {editingUser ? `Sửa Tài Khoản: ${editingUser.username}` : 'Thêm Tài Khoản Người Dùng Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Đăng Nhập (Username) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Từ 3-20 ký tự (viết liền không dấu, vd: nguyenvana)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên Đầy Đủ *</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vai Trò & Phân Quyền *</label>
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name === 'Admin' ? 'Quản Trị Viên (Admin)' : r.name === 'Editor' ? 'Biên Tập Viên (Editor)' : 'Khách Hàng (Customer)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái Hoạt Động</label>
                  <select
                    value={formIsActive ? '1' : '0'}
                    onChange={(e) => setFormIsActive(e.target.value === '1')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="1">Kích Hoạt (Hoạt động)</option>
                    <option value="0">Khóa Tài Khoản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser ? 'Đổi Mật Khẩu Mới (Để trống nếu giữ nguyên)' : 'Mật Khẩu Khởi Tạo *'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? '•••••••• (Bỏ trống nếu không đổi)' : 'Tối thiểu 6 ký tự'}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 btn-pill btn-pill-primary text-xs py-3 font-bold">
                  {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-pill btn-pill-secondary text-xs py-3">
                  Hủy Bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL XÁC NHẬN XÓA TÀI KHOẢN */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Tài Khoản</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa tài khoản <strong>"{deleteTarget.username}"</strong> ({deleteTarget.fullName}) không?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
              >
                Xác Nhận Xóa
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}