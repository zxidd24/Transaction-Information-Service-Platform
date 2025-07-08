import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const ExcelFileList = forwardRef(({ onFileClick }, ref) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil(files.length / pageSize);

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
    <div style={{ margin: '2em 0', textAlign: 'left', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
      <button
        onClick={() => setShowList(v => !v)}
        style={{
          background: showList ? 'linear-gradient(90deg,#49c7f7,#1677ff)' : '#f6faff',
          color: showList ? '#fff' : '#1677ff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 28px',
          fontSize: 18,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: showList ? '0 2px 8px #1677ff22' : 'none',
          marginBottom: 16,
          transition: 'all 0.2s',
        }}
      >
        {showList ? '收起已导入文件列表' : '展开已导入文件列表'}
      </button>
      {showList && (
        <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: 8, boxShadow: '0 2px 12px #1677ff11', padding: 20, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: '#1677ff' }}>已上传文件（{files.length}）</span>
            <button onClick={fetchFiles} style={{ background: '#f6faff', color: '#1677ff', border: '1px solid #1677ff', borderRadius: 4, padding: '4px 14px', cursor: 'pointer', fontSize: 14 }}>刷新</button>
          </div>
          {loading && <div>加载中...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.slice((page-1)*pageSize, page*pageSize).map((file) => (
              <li key={file} style={{ marginBottom: 6 }}>
                <button
                  onClick={() => onFileClick && onFileClick(file)}
                  style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', textDecoration: 'underline', fontSize: 16 }}
                >
                  {file}
                </button>
              </li>
            ))}
            {(!loading && files.length === 0) && <li>暂无文件</li>}
          </ul>
          {/* 分页按钮 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
                style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #1677ff', background: page === 1 ? '#eee' : '#f6faff', color: '#1677ff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >上一页</button>
              <span style={{ fontSize: 15 }}>第 {page} / {totalPages} 页</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={page === totalPages}
                style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #1677ff', background: page === totalPages ? '#eee' : '#f6faff', color: '#1677ff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >下一页</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ExcelFileList;
