import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const ExcelFileList = forwardRef(({ onFileClick }, ref) => {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  // 先根据关键字过滤文件名，再分页
  const filteredFiles = files.filter(file => file.replace(/^\d+-/, '').toLowerCase().includes(search.trim().toLowerCase()));
  const totalPages = Math.ceil(filteredFiles.length / pageSize);

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
    <div style={{ margin: '2em 0', textAlign: 'left', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
        {/* 添加文件按钮由父组件传递或在此插槽插入 */}
        {typeof window !== 'undefined' && window.ExcelUploadSlot}
        <button
          onClick={() => setShowList(v => !v)}
        >
          {showList ? '收起已导入文件列表' : '展开已导入文件列表'}
        </button>
      </div>
      {showList && (
        <div style={{ background: '#fff', border: '1px solid #e6e6e6', borderRadius: 8, boxShadow: '0 2px 12px #1677ff11', padding: 20, marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: '#1677ff' }}>已上传文件（{files.length}）</span>
        <input
          type="text"
          placeholder="搜索文件"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1); // 检索时重置到第一页
          }}
          style={{ flex: 1, minWidth: 120, maxWidth: 200, border: '1px solid #e6e6e6', borderRadius: 4, padding: '4px 8px', fontSize: 15 }}
        />
        <button onClick={fetchFiles}>刷新</button>
      </div>
          {loading && <div>加载中...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredFiles.slice((page-1)*pageSize, page*pageSize).map((file) => {
              // 去除前缀数字和连字符，仅显示原文件名
              const displayName = file.replace(/^\d+-/, '');
              return (
                <li key={file} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => onFileClick && onFileClick(file)}
                  >
                    {displayName}
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!window.confirm(`确定要删除文件：${displayName} 吗？`)) return;
                      try {
                        const res = await fetch(`http://localhost:3001/files/${encodeURIComponent(file)}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('删除失败');
                        fetchFiles();
                      } catch (err) {
                        alert('删除失败：' + err.message);
                      }
                    }}
                    className="btn-danger"
                    title="删除此文件"
                    style={{
                      padding: '8px 10px',
                      fontSize: '14px',
                      borderRadius: '4px',
                      minWidth: '60px'
                    }}
                  >删除</button>
                </li>
              );
            })}
            {(!loading && filteredFiles.length === 0) && <li>暂无文件</li>}
          </ul>
          {/* 分页按钮 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
              >上一页</button>
              <span style={{ fontSize: 15 }}>第 {page} / {totalPages} 页</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={page === totalPages}
              >下一页</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ExcelFileList;
