import React, { useEffect, useState } from 'react';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import UserDisplayTable from '../components/UserDisplayTable';
import EditUserRole from '../components/EditUserRole';
import ConfirmBox from '../components/ConfirmBox';

const AdminUserDisplayPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
    role: ""
  });
  const [deleteUser, setDeleteUser] = useState({
    _id: ""
  });
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false);

  // Fetch user data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getUsers,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        setData(responseData.data || []); // Fallback to an empty array if data is undefined
      }
    } catch (error) {
      AxiosToastError(error);
      setData([]); // Fallback to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle edit user
  const handleEdit = (user) => {
    setOpenEdit(true);
    setEditData(user);
  };

  // Handle delete user
  const handleDelete = (user) => {
    setOpenDeleteConfirmBox(true);
    setDeleteUser(user);
  };


  const handleUpdateUserRole = async (updatedRole) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateUserRole,
        data: {
          _id: editData._id,
          role: updatedRole
        }
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchUsers(); // Refresh user list
        setOpenEdit(false);
        setEditData({ _id: "", role: "" });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  
  const handleDeleteUser = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteUser,
        data: deleteUser
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchUsers(); // Refresh user list
        setOpenDeleteConfirmBox(false);
        setDeleteUser({ _id: "" });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };


  return (
    <section className="">
      <div className="p-2 bg-white shadow-md flex items-center justify-between">
        <h2 className="font-semibold">Users</h2>
      </div>

      <div className="overflow-auto w-full max-w-[95vw]">
        <UserDisplayTable
          data={data}
          onEdit={handleEdit} // Pass the edit handler
          onDelete={handleDelete} // Pass the delete handler
        />
      </div>

      {/* Edit User Role Modal */}
      {openEdit && (
        <EditUserRole
          data={editData}
          close={() => setOpenEdit(false)}
          updateRole={handleUpdateUserRole}
        />
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteConfirmBox && (
        <ConfirmBox
          cancel={() => setOpenDeleteConfirmBox(false)}
          close={() => setOpenDeleteConfirmBox(false)}
          confirm={handleDeleteUser}
        />
      )}
    </section>
  );
};

export default AdminUserDisplayPage;