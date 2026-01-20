// src/pages/dashboard/Permission.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosIntance";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiUserCheck,
} from "react-icons/fi";

const Permission = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);


  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empPassword, setEmpPassword] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);

  /* ================= Fetch ================= */
  
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/Permission");
      setPermissions(res.data);
    } catch {
      Swal.fire("خطأ", "فشل تحميل الصلاحيات", "error");
    } finally {
      setLoading(false);
    }
  };


  /* ================= Assign ================= */
  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const handleSelectUser = (userId) => {
  setSelectedUser(userId);

  const user = employees.find((e) => e.id === userId);

  if (user && user.permissions) {
    setSelectedPermissions(user.permissions.map((p) => p.id));
  } else {
    setSelectedPermissions([]);
  }
};


  const handleAssign = async () => {
    if (!selectedUser || selectedPermissions.length === 0) {
      Swal.fire("تنبيه", "اختر مستخدم وصلاحية واحدة على الأقل", "warning");
      return;
    }

    try {
      await axiosInstance.put("/Permission/update-user-permissions", {
        userId: selectedUser,
        permissionIds: selectedPermissions,
      });

      Swal.fire("تم", "تم تحديث صلاحيات المستخدم", "success");
      setSelectedPermissions([]);
      setSelectedUser("");
      setIsAssignOpen(false);
      await fetchEmployees();
    } catch {
      Swal.fire("خطأ", "فشل تحديث الصلاحيات", "error");
    }
  };

  /* ================= UI ================= */

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );
  /* ================= Employee ================= */

  const fetchEmployees = async () => {
  setEmployeesLoading(true);
  try {
    const res = await axiosInstance.get("/Users/employees");
    setEmployees(res.data.data);
  } catch {
    Swal.fire("خطأ", "فشل تحميل الموظفين", "error");
  } finally {
    setEmployeesLoading(false);
  }
};


  const handleAddEmployee = async () => {
  if (!empName || !empEmail || !empPassword) {
    Swal.fire("تنبيه", "من فضلك اكمل البيانات الأساسية", "warning");
    return;
  }

  try {
    await axiosInstance.post("/Auth/add-employee", {
      name: empName,
      email: empEmail,
      phone: empPhone,
      password: empPassword,
    });

    Swal.fire("تم", "تم تسجيل الموظف بنجاح", "success");

    setEmpName("");
    setEmpEmail("");
    setEmpPhone("");
    setEmpPassword("");
    setIsAddEmployeeOpen(false);
    await fetchEmployees()
  } catch {
    Swal.fire("خطأ", "فشل تسجيل الموظف", "error");
  }
};

const fetchEmployeeById = async (id) => {
  try {
    const res = await axiosInstance.get(`/Users/${id}`);
    setSelectedEmployee(res.data.data);
    setIsEmployeeDetailsOpen(true); 
  } catch {
    Swal.fire("خطأ", "فشل تحميل بيانات الموظف", "error");
  }
};

  useEffect(() => {
    fetchPermissions();
    fetchEmployees()
  }, []);


  return (
    
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600">إدارة الصلاحيات</h1>
       <div className="flex items-center gap-3">
            <button
                onClick={() => {
                  setSelectedUser("");
                  setSelectedPermissions([]);
                  setIsAssignOpen(true);
                }}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FiUserCheck />
              ربط صلاحيات بمستخدم
            </button>

            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FiPlus />
              تسجيل موظف
            </button>
        </div>

      </div>

      {/* Create */}

      {/* <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-bold text-blue-600 mb-3">إضافة صلاحية</h2>
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="اسم الصلاحية"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 rounded flex items-center gap-1"
          >
            <FiPlus /> إضافة
          </button>
        </div>
      </div> */}

      {/* List */}
      {/* <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-bold text-blue-600 mb-4">كل الصلاحيات</h2>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full border">
            <thead className="bg-blue-50">
              <tr>
                <th className="border p-2">الاسم</th>
                <th className="border p-2 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">
                    {editId === p.id ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      p.name
                    )}
                  </td>
                  <td className="border p-2 flex gap-3 justify-center">
                    {editId === p.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(p.id)}
                          className="text-green-600"
                        >
                          <FiSave />
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-gray-500"
                        >
                          <FiX />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditId(p.id);
                            setEditName(p.name);
                          }}
                          className="text-blue-600"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div> */}

        {/* Employee */}

      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-bold text-blue-600 mb-4">
          الموظفين المسجلين
        </h2>

        {employeesLoading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="border p-2">الاسم</th>
                <th className="border p-2">الإيميل</th>
                <th className="border p-2">الصلاحيات</th>
                <th className="border p-2 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="border p-2">{emp.fullName}</td>
                  <td className="border p-2">{emp.email}</td>
                   <td className="border p-2">
                      {emp.permissions && emp.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {emp.permissions.map((perm) => (
                              <span
                                key={perm.id}
                                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                              >
                                {perm.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => fetchEmployeeById(emp.id)}
                      className="text-blue-600 flex items-center gap-1 mx-auto"
                    >
                      <FiUserCheck />
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= Assign Modal ================= */}

      {isAssignOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[520px] rounded-xl shadow-lg p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-600">
                ربط الصلاحيات بالمستخدم
              </h2>
              <button onClick={() => setIsAssignOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="space-y-4">
              {/* User */}
              <div>
                <label className="block mb-1 font-medium">
                  اختر المستخدم
                </label>
                <select
                  className="border rounded p-2 w-full"
                  value={selectedUser}
                  onChange={(e) => handleSelectUser(e.target.value)}
                >
                  <option value="">اختر مستخدم</option>
                  {employees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} || {u.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions Checkboxes */}
              <div>
                <label className="block mb-2 font-medium">
                  اختر الصلاحيات
                </label>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                  {permissions.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setIsAssignOpen(false)}
                className="px-4 py-2 rounded border"
              >
                إلغاء
              </button>
              <button
                onClick={handleAssign}
                className="px-6 py-2 rounded bg-blue-600 text-white"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Add Employee  Modal ================= */}
      
      {isAddEmployeeOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[520px] rounded-xl shadow-lg p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-600">
                  تسجيل موظف جديد
                </h2>
                <button onClick={() => setIsAddEmployeeOpen(false)}>
                  <FiX />
                </button>
              </div>

              <div className="space-y-3">
                <label htmlFor="name" className="block mb-1 font-medium">اسم الموظف</label>
                <input
                  id="name"
                  className="border rounded p-2 w-full"
                  placeholder="اسم الموظف"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                />

                <label htmlFor="name" className="block mb-1 font-medium">البريد الإلكتروني</label>
                <input
                 id="email"
                  className="border rounded p-2 w-full"
                  placeholder="البريد الإلكتروني"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                />

                <label htmlFor="name" className="block mb-1 font-medium">رقم الهاتف</label>
                <input
                  id="phone"
                  className="border rounded p-2 w-full"
                  placeholder="رقم الهاتف"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                />

                <label htmlFor="password" className="block mb-1 font-medium">كلمة المرور</label>
                <input
                 id="password"
                  type="password"
                  className="border rounded p-2 w-full"
                  placeholder="كلمة المرور"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 rounded border"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddEmployee}
                  className="px-6 py-2 rounded bg-green-600 text-white"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        )}

      {isEmployeeDetailsOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[600px] rounded-xl shadow-lg p-6 space-y-5">

              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-600">
                  تفاصيل الموظف
                </h2>
                <button
                  onClick={() => setIsEmployeeDetailsOpen(false)}
                >
                  <FiX />
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-2 gap-4 text-sm">

                <div>
                  <p className="text-gray-500">الاسم</p>
                  <p className="font-medium">{selectedEmployee.name}</p>
                </div>

                <div>
                  <p className="text-gray-500">البريد الإلكتروني</p>
                  <p className="font-medium">{selectedEmployee.email}</p>
                </div>

                <div>
                  <p className="text-gray-500">رقم الهاتف</p>
                  <p className="font-medium">{selectedEmployee.phoneNumber}</p>
                </div>

                
                <div>
                  <p className="text-gray-500">الصلاحيات</p>
                    {selectedEmployee.permissions && selectedEmployee.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedEmployee.permissions.map((per) => (
                          <span
                            key={per.id}
                          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                          >
                          {per.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>

                
              

                <div>
                  <p className="text-gray-500">البريد مفعل</p>
                  <p className="font-medium">
                    {selectedEmployee.isEmailVerified ? "نعم" : "لا"}
                  </p>
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsEmployeeDetailsOpen(false)}
                  className="px-6 py-2 rounded bg-blue-600 text-white"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}


    </div>
  );
};

export default Permission;
