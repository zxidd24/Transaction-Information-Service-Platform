import React, { useEffect, useState } from 'react';
import { utils, writeFile } from 'xlsx';
import * as XLSX from 'xlsx';

const ExcelPreview = ({ fileName }) => {
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    if (!fileName) return;
    setError(null);
    setSheets([]);
    setData([]);
    setActiveSheet('');
    // 获取文件并解析
    fetch(`http://localhost:3001/uploads/${encodeURIComponent(fileName)}`)
      .then(res => {
        if (!res.ok) throw new Error('文件下载失败');
        return res.arrayBuffer();
      })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        setSheets(workbook.SheetNames);
        const firstSheet = workbook.SheetNames[0];
        setActiveSheet(firstSheet);
        setData(XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1 }));
        setFilter({});
      })
      .catch(err => setError(err.message));
  }, [fileName]);

  const handleSheetChange = (sheet) => {
    setActiveSheet(sheet);
    fetch(`http://localhost:3001/uploads/${encodeURIComponent(fileName)}`)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        setData(XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 }));
        setFilter({});
      });
  };

  if (!fileName) return null;

  // 处理筛选
  let filteredData = data;
  if (data.length > 1 && Object.keys(filter).length > 0) {
    filteredData = [data[0], ...data.slice(1).filter(row => {
      return Object.entries(filter).every(([colIdx, val]) => {
        if (!val) return true;
        return (row[colIdx] || '').toString().includes(val);
      });
    })];
  }

  // 导出当前预览的Excel
  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) return;
    const ws = utils.aoa_to_sheet(filteredData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, activeSheet || 'Sheet1');
    writeFile(wb, fileName ? `导出_${fileName}` : '导出表格.xlsx');
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h2>预览：{fileName}</h2>
      <button
        onClick={handleExport}
        style={{ marginBottom: 16, background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #1677ff22' }}
        disabled={!filteredData || filteredData.length === 0}
      >
        导出当前表为Excel
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {sheets.length > 1 && (
        <div style={{ marginBottom: 8 }}>
          {sheets.map(sheet => (
            <button
              key={sheet}
              onClick={() => handleSheetChange(sheet)}
              style={{ marginRight: 8, fontWeight: sheet === activeSheet ? 'bold' : 'normal' }}
            >
              {sheet}
            </button>
          ))}
        </div>
      )}
      <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            {data.length > 0 && (
              <tr>
                {data[0].map((cell, j) => (
                  <th key={j} style={{ border: '1px solid #ddd', padding: 4, background: '#f6faff' }}>
                    {cell}
                  </th>
                ))}
              </tr>
            )}
            {data.length > 1 && (
              <tr>
                {data[0].map((cell, j) => (
                  <th key={j} style={{ border: '1px solid #ddd', padding: 2, background: '#f0f0f0' }}>
                    <input
                      style={{ width: '90%', padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3 }}
                      placeholder={`筛选${cell}`}
                      value={filter[j] || ''}
                      onChange={e => setFilter(f => ({ ...f, [j]: e.target.value }))}
                    />
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {filteredData.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ border: '1px solid #ddd', padding: 4 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div style={{ padding: 16 }}>表格无数据</div>}
      </div>
    </div>
  );
};

export default ExcelPreview;
