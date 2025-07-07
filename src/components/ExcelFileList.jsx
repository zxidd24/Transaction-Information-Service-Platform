import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const ExcelFileList = forwardRef(({ onFileClick }, ref) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/files');
      if (!res.ok) throw new Error('获取文件列表失败');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchFiles
  }));
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ margin: '2em 0' }}>
      <h2>已上传文件列表</h2>
      {loading && <div>加载中...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {files.map((file) => (
          <li key={file}>
            <button onClick={() => onFileClick && onFileClick(file)} style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', textDecoration: 'underline' }}>{file}</button>
          </li>
        ))}
        {(!loading && files.length === 0) && <li>暂无文件</li>}
      </ul>
      <button onClick={fetchFiles} style={{ marginTop: 8 }}>刷新列表</button>
    </div>
  );
});

export default ExcelFileList;
