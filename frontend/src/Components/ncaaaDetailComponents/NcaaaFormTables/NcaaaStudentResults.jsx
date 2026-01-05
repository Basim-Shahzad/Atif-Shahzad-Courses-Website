import React, { useState, useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Toast } from "primereact/toast";
import Papa from "papaparse";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from "primereact/floatlabel";

const NcaaaStudentResults = () => {
   const toast = useRef(null);
   const [ comment, setComment ] = useState()

   // Initial table data
   const [data, setData] = useState([
      {
         id: "students",
         label: "Number of Students",
         aPlus: "",
         a: "",
         bPlus: "",
         b: "",
         cPlus: "",
         c: "",
         dPlus: "",
         d: "",
         f: "",
         denied: "",
         inProgress: "",
         incomplete: "",
         pass: "",
         fail: "",
         withdrawn: "",
      },
      {
         id: "percentage",
         label: "Percentage",
         aPlus: "",
         a: "",
         bPlus: "",
         b: "",
         cPlus: "",
         c: "",
         dPlus: "",
         d: "",
         f: "",
         denied: "",
         inProgress: "",
         incomplete: "",
         pass: "",
         fail: "",
         withdrawn: "",
      },
   ]);

   // Update table cell
   const updateCell = (rowId, columnId, value) => {
      setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
   };

   // Map CSV row to table row
   const csvToTableKeys = (csvRow) => ({
      id: csvRow.Field === "Number of Students" ? "students" : "percentage",
      label: csvRow.Field,
      aPlus: Number(csvRow.Ap || 0),
      a: Number(csvRow.A || 0),
      bPlus: Number(csvRow.Bp || 0),
      b: Number(csvRow.B || 0),
      cPlus: Number(csvRow.Cp || 0),
      c: Number(csvRow.C || 0),
      dPlus: Number(csvRow.Dp || 0),
      d: Number(csvRow.D || 0),
      f: Number(csvRow.F || 0),
      denied: Number(csvRow.DN || 0),
      inProgress: Number(csvRow.IP || 0),
      incomplete: Number(csvRow.IC || 0),
      pass: Number(csvRow.P || 0),
      fail: Number(csvRow.F || 0),
      withdrawn: Number(csvRow.W || 0),
   });

   // Handle CSV upload
   const handleCsvUpload = (event) => {
      const file = event.files[0];
      if (!file) return;

      Papa.parse(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const parsedData = results.data;

            if (!parsedData || parsedData.length === 0) {
               toast.current.show({
                  severity: "warn",
                  summary: "CSV Upload",
                  detail: "CSV file is empty or invalid.",
               });
               return;
            }

            const tableData = parsedData.map(csvToTableKeys);
            setData(tableData);

            toast.current.show({
               severity: "success",
               summary: "CSV Upload",
               detail: "Data successfully loaded!",
            });
         },
         error: (err) => {
            toast.current.show({
               severity: "error",
               summary: "CSV Upload Error",
               detail: err.message,
            });
         },
      });
   };

   // Table columns
   const columns = [
      {
         header: "Grades",
         columns: [
            {
               accessorKey: "label",
               header: "",
               cell: ({ getValue }) => <div className="px-3 py-2">{getValue()}</div>,
            },
         ],
      },
      {
         header: "Grades",
         columns: [
            { accessorKey: "aPlus", header: "A+" },
            { accessorKey: "a", header: "A" },
            { accessorKey: "bPlus", header: "B+" },
            { accessorKey: "b", header: "B" },
            { accessorKey: "cPlus", header: "C+" },
            { accessorKey: "c", header: "C" },
            { accessorKey: "dPlus", header: "D+" },
            { accessorKey: "d", header: "D" },
            { accessorKey: "f", header: "F" },
         ],
      },
      {
         header: "Status Distributions",
         columns: [
            { accessorKey: "denied", header: "Denied Entry" },
            { accessorKey: "inProgress", header: "In Progress" },
            { accessorKey: "incomplete", header: "Incomplete" },
            { accessorKey: "pass", header: "Pass" },
            { accessorKey: "fail", header: "Fail" },
            { accessorKey: "withdrawn", header: "Withdrawn" },
         ],
      },
   ];

   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
   });

   return (
      <>
         <div className="max-w-full overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-lg">
               <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <th
                              key={header.id}
                              colSpan={header.colSpan}
                              className="bg-indigo-700 text-white px-3 py-3 text-sm font-semibold border border-indigo-600">
                              {header.isPlaceholder
                                 ? null
                                 : flexRender(header.column.columnDef.header, header.getContext())}
                           </th>
                        ))}
                     </tr>
                  ))}
               </thead>
               <tbody>
                  {table.getRowModel().rows.map((row) => (
                     <tr key={row.id} className={row.original.id === "students" ? "bg-indigo-100" : "bg-indigo-50"}>
                        {row.getVisibleCells().map((cell) => (
                           <td key={cell.id} className="border border-gray-300">
                              {cell.column.id === "label" ? (
                                 flexRender(cell.column.columnDef.cell, cell.getContext())
                              ) : (
                                 <input
                                    type="text"
                                    value={cell.getValue()}
                                    onChange={(e) => updateCell(row.original.id, cell.column.id, e.target.value)}
                                    className="w-full px-3 py-2 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder=""
                                 />
                              )}
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Toast ref={toast}></Toast>
            <FileUpload
               mode="basic"
               name="file"
               accept=".csv"
               maxFileSize={3000000}
               onSelect={handleCsvUpload}
               chooseLabel="Upload CSV"
            />
            <button
               onClick={() => console.log("Current data:", data)}
               className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors">
               Log Data to Console
            </button>
         </div>

         <div className="mt-8" >
            <FloatLabel>
               <InputTextarea
                  id="comments"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className=""
                  rows={4}
                  cols={40}
               />
               <label htmlFor="comments">Comments</label>
            </FloatLabel>
         </div>
      </>
   );
};

export default NcaaaStudentResults;
