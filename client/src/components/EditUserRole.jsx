import React, { useState } from 'react';
import toast from 'react-hot-toast';

const EditUserRole = ({ data, close, updateRole }) => {
  const [role, setRole] = useState(data.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    updateRole(role); // Call the update function passed from the parent
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white p-6 rounded-lg w-full max-w-md'>
        <h2 className='text-lg font-semibold mb-4'>Edit User Role</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className='w-full p-2 border rounded'
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={close}
              className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserRole;