import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { HiPencil } from "react-icons/hi";
import { MdDelete } from "react-icons/md";

const UserDisplayTable = ({ data, onEdit, onDelete }) => {
  const columnHelper = createColumnHelper();

  // Define columns for the table
  const columns = [
    columnHelper.accessor('name', {
      header: "Name",
    }),
    columnHelper.accessor('email', {
      header: "Email",
    }),
    columnHelper.accessor('role', {
      header: "Role",
    }),
    columnHelper.accessor('_id', {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onEdit(row.original)} // Pass the user data to the onEdit function
            className="p-2 bg-green-100 rounded-full hover:text-green-600"
          >
            <HiPencil size={20} />
          </button>
          <button
            onClick={() => onDelete(row.original)} // Pass the user data to the onDelete function
            className="p-2 bg-red-100 rounded-full text-red-500 hover:text-red-600"
          >
            <MdDelete size={20} />
          </button>
        </div>
      ),
    }),
  ];

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2">
      <table className="w-full py-0 px-0 border-collapse">
        <thead className="bg-black text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              <th className="border px-2 py-1">Sr.No</th>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border px-2 py-1 whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1 text-center">{index + 1}</td>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border px-2 py-1 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-4" />
    </div>
  );
};

export default UserDisplayTable;