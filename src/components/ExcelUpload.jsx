import React, { useRef, useState } from 'react';

const ExcelUpload = ({ onUploadSuccess }) => {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('http://localhost:3001/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('上传失败: ' + file.name);
      }
      onUploadSuccess && onUploadSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <label style={{
        display: 'inline-block',
        padding: '0.6em 1.5em',
        background: uploading ? '#ccc' : 'linear-gradient(90deg,#1677ff,#49c7f7)',
        color: '#fff',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 500,
        cursor: uploading ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 8px #1677ff22',
        transition: 'background 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <input
          type="file"
          accept=".xls,.xlsx"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
          multiple
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        />
        {uploading ? '上传中...' : '添加文件（可多选）'}
      </label>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default ExcelUpload;
