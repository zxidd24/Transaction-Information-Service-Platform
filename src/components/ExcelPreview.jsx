import React, { useEffect, useState } from 'react';
import { utils, writeFile } from 'xlsx';
import * as XLSX from 'xlsx';


const ExcelPreview = ({ fileName }) => {
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({});
  const [zoom, setZoom] = useState(1);
  const [editData, setEditData] = useState(null); // 用于编辑的表格数据
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!fileName) return;
    setError(null);
    setSheets([]);
    setData([]);
    setActiveSheet('');
    setEditData(null);
    setEditing(false);
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
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1 });
        setData(sheetData);
        setEditData(sheetData);
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
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
        setData(sheetData);
        setEditData(sheetData);
        setFilter({});
        setEditing(false);
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

  // 编辑表格内容
  const handleCellEdit = (rowIdx, colIdx, value) => {
    setEditData(prev => {
      const next = prev.map(r => [...r]);
      next[rowIdx][colIdx] = value;
      return next;
    });
  };

  // 保存编辑内容到服务器
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // 生成新的Excel文件（只保存当前sheet）
      const ws = utils.aoa_to_sheet(editData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, activeSheet || 'Sheet1');
      const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      // 发送到后端覆盖原文件
      const formData = new FormData();
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      formData.append('file', blob, fileName);
      const res = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('保存失败');
      setEditing(false);
      setData(editData);
      alert('保存成功！');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
      <h2>预览：{fileName.replace(/^\d+-/, '')}</h2>
      {/* 工具栏区域 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          border: '1.5px solid #1677ff',
          borderRadius: 8,
          background: '#fafdff',
          padding: 12,
          marginBottom: 18,
          boxShadow: '0 2px 8px #1677ff11',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={handleExport}
          className="btn-main"
          style={
            (!filteredData || filteredData.length === 0)
              ? undefined
              : {
                  background: '#1677ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px #1677ff55'
                }
          }
          disabled={!filteredData || filteredData.length === 0}
        >
          导出当前表为Excel
        </button>
        {/* 缩放控件 */}
        <div
          style={{
            background: '#1677ff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 6px #1677ff55',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>缩放：</span>
          <button
            onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 8,
              cursor: 'pointer'
            }}
          >-</button>
          <span style={{ minWidth: 38, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 8,
              cursor: 'pointer'
            }}
          >+</button>
        </div>
        {/* 编辑/保存按钮 */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-main"
            style={{
              background: '#1677ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 2px 6px #1677ff55'
            }}
          >
            编辑表格
          </button>
        )}
        {editing && (
          <>
            <button onClick={handleSave} disabled={saving} className="btn-main" style={{ background: '#52c41a', padding: '6px 18px', fontSize: 15, color: '#fff', opacity: saving ? 0.7 : 1 }}>{saving ? '保存中...' : '保存表格'}</button>
            <button onClick={() => { setEditing(false); setEditData(data); }} className="btn-danger" style={{ padding: '6px 18px', fontSize: 15 }}>取消编辑</button>
          </>
        )}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {sheets.length > 1 && (
        <div style={{ marginBottom: 8 }}>
          {sheets.map(sheet => (
            <button
              key={sheet}
              onClick={() => handleSheetChange(sheet)}
              className={sheet === activeSheet ? 'btn-main btn-active' : 'btn-main'}
              style={{ marginRight: 8, padding: '2px 12px', fontWeight: sheet === activeSheet ? 'bold' : 'normal', fontSize: 15 }}
            >
              {sheet}
            </button>
          ))}
        </div>
      )}
      <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: '0 0', minWidth: 600, width: 'fit-content', display: 'inline-block' }}>
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
                        disabled={editing}
                      />
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {(editing ? editData : filteredData).slice(1).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ border: '1px solid #ddd', padding: 4 }}>
                      {editing ? (
                        <input
                          value={cell === undefined ? '' : cell}
                          onChange={e => handleCellEdit(i + 1, j, e.target.value)}
                          style={{ width: '100%', border: '1px solid #bbb', borderRadius: 3, padding: '2px 4px', fontSize: 14 }}
                        />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && <div style={{ padding: 16 }}>表格无数据</div>}
      </div>
    </div>
  );
};

export default ExcelPreview;
