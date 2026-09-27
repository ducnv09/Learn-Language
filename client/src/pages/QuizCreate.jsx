import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCloudUpload, HiOutlineSparkles, HiOutlineDocument } from 'react-icons/hi';
import axios from 'axios';
import FileUploadZone from '../components/FileUploadZone';
import { uploadFiles } from '../services/uploadService';
import './QuizCreate.css';

const API_URL = 'http://localhost:3001/api';

function QuizCreate() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFileIds, setUploadedFileIds] = useState([]);
  const [quizName, setQuizName] = useState('');
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const res = await uploadFiles(formData);
      const ids = res.files.map((f) => f.id);
      setUploadedFileIds(ids);
      setUploadedFiles(files);
      setFiles([]);
      setResult({ success: true, message: `${res.message}. Bây giờ bạn có thể xử lý bằng AI!` });
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.error || 'Upload thất bại. Vui lòng thử lại.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async () => {
    if (uploadedFileIds.length === 0) return;

    setProcessing(true);
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/quizzes/process`, {
        file_ids: uploadedFileIds,
        title: quizName || undefined,
      });
      
      const { data } = res;
      setResult({
        success: true,
        message: `🎉 Đã tạo ${data.questions_count} câu hỏi trắc nghiệm!`,
        quizBank: data.quizBank,
      });
      setUploadedFileIds([]);
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.error || 'Xử lý AI thất bại. Xin thử lại.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="quiz-create-page fade-in">
      <div className="page-header">
        <h1>Tạo Bộ câu hỏi trắc nghiệm</h1>
        <p>Tải lên tài liệu để AI tự động trích xuất bộ câu hỏi trắc nghiệm</p>
      </div>

      <div className="upload-content card">
        {uploadedFiles.length === 0 && (
          <FileUploadZone files={files} setFiles={setFiles} />
        )}

        {uploadedFiles.length > 0 && (
          <div className="upload-file-list">
            <h3 className="upload-file-list-title">
              File đã tải lên ({uploadedFiles.length})
            </h3>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="upload-file-item">
                <HiOutlineDocument className="upload-file-item-icon" />
                <div className="upload-file-item-info">
                  <span className="upload-file-item-name">{file.name}</span>
                  <span className="upload-file-item-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <span className="upload-file-item-status">✓ Đã upload</span>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className={`upload-result ${result.success ? 'upload-result--success' : 'upload-result--error'}`}>
            <p>{result.message}</p>
            {result.quizBank && (
              <div className="upload-result-actions">
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/quizzes/study/${result.quizBank.id}`)}>
                  Bắt đầu làm bài
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Upload files */}
        {files.length > 0 && (
          <div className="upload-actions">
            <button
              className="btn btn-primary"
              disabled={files.length === 0 || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <div className="loading-spinner loading-spinner--white" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <HiOutlineCloudUpload />
                  Tải lên ({files.length} file)
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: AI Processing */}
        {uploadedFileIds.length > 0 && (
          <div className="upload-ai-section fade-in">
            <h3>✨ Trích xuất bằng AI</h3>
            <p>Đặt tên cho bộ câu hỏi (tùy chọn):</p>
            <input
              type="text"
              placeholder="Vd: Đề cương môn Oracle, Tiếng Anh B1..."
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
            />
            <button
              className="btn btn-primary mt-2"
              disabled={processing}
              onClick={handleProcess}
            >
              {processing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="loading-spinner loading-spinner--white" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                    <span>AI đang đọc và phân tích toàn bộ file...</span>
                  </div>
                  <span style={{ fontSize: '0.85em', opacity: 0.9 }}>* Quá trình này có thể mất từ 1-2 phút đối với file lớn, vui lòng không đóng trang.</span>
                </div>
              ) : (
                <>
                  <HiOutlineSparkles />
                  Tạo Bộ câu hỏi bằng AI
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizCreate;
