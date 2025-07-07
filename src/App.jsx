import { useState, useRef } from 'react'
import ExcelUpload from './components/ExcelUpload'
import ExcelFileList from './components/ExcelFileList'
import ExcelPreview from './components/ExcelPreview'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [previewFile, setPreviewFile] = useState('');

  // 用于触发文件列表刷新
  const fileListRef = useRef();
  const handleUploadSuccess = () => {
    if (fileListRef.current && fileListRef.current.fetchFiles) {
      fileListRef.current.fetchFiles();
    }
    alert('上传成功！');
  }

  return (
    <>
      <h1 style={{ margin: '1.5em 0', fontSize: '2rem', color: '#1677ff', letterSpacing: '0.1em' }}>
        西安城乡融合要素交易信息服务平台
      </h1>
      {/* Excel 文件上传组件 */}
      <ExcelUpload onUploadSuccess={handleUploadSuccess} />
      {/* Excel 文件列表展示组件，点击文件名可预览 */}
      <ExcelFileList ref={fileListRef} onFileClick={setPreviewFile} />
      {/* Excel 文件预览组件 */}
      <ExcelPreview fileName={previewFile} />
      {/* 业务内容区域结束 */}
      <p className="read-the-docs" style={{ marginTop: 32, color: '#888' }}>
        西安城乡融合交易市场
      </p>
    </>
  )
}

export default App
