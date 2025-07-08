import { useState, useRef } from 'react'
import ExcelUpload from './components/ExcelUpload'
import ExcelFileList from './components/ExcelFileList'
import ExcelPreview from './components/ExcelPreview'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function App() {
  const [previewFile, setPreviewFile] = useState('');
  const fileListRef = useRef();
  const handleUploadSuccess = () => {
    if (fileListRef.current && fileListRef.current.fetchFiles) {
      fileListRef.current.fetchFiles();
    }
    alert('上传成功！');
  };

  return (
    <div className="main-bg">
      <div className="main-card">
        <h1 className="main-title">
          西安城乡融合要素交易信息服务平台
        </h1>
        <div className="section-card">
          <ExcelUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="section-card">
          <ExcelFileList ref={fileListRef} onFileClick={setPreviewFile} />
        </div>
        <div className="section-card">
          <ExcelPreview fileName={previewFile} />
        </div>
        <div className="footer-tip">
          西安城乡融合交易市场
        </div>
      </div>
    </div>
  );
}

export default App
