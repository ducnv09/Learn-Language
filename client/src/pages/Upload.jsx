import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCloudUpload, HiOutlineSparkles } from 'react-icons/hi';
import FileUploadZone from '../components/FileUploadZone';
import { uploadFiles } from '../services/uploadService';
import { processFiles } from '../services/exerciseService';
import './Upload.css';

function Upload() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadedFileIds, setUploadedFileIds] = useState([]);
    const [deckName, setDeckName] = useState('');
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
            setResult({ success: true, message: `${res.message}. Bây giờ bạn có thể xử lý bằng AI!` });
            setFiles([]);
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
            const res = await processFiles({
                file_ids: uploadedFileIds,
                deck_name: deckName || undefined,
            });
            setResult({
                success: true,
                message: `🎉 Đã tạo ${res.flashcards_count} flashcard và ${res.exercises_count} bài tập!`,
                deck: res.deck,
            });
            setUploadedFileIds([]);
        } catch (err) {
            setResult({
                success: false,
                message: err.response?.data?.error || 'Xử lý AI thất bại. Kiểm tra API key.',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="upload-page animate-fade-in">
            <div className="page-header">
                <h1>Upload Tài liệu</h1>
                <p>Tải lên tài liệu để AI tự động tạo flashcard và bài tập cho bạn</p>
            </div>

            <div className="upload-content card">
                <FileUploadZone files={files} setFiles={setFiles} />

                {result && (
                    <div className={`upload-result ${result.success ? 'upload-result--success' : 'upload-result--error'}`}>
                        <p>{result.message}</p>
                        {result.deck && (
                            <div className="upload-result-actions">
                                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/study/${result.deck.id}`)}>
                                    Xem Flashcard
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/exercise/${result.deck.id}`)}>
                                    Làm bài tập
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: Upload files */}
                <div className="upload-actions">
                    <button
                        className="btn btn-primary"
                        disabled={files.length === 0 || uploading}
                        onClick={handleUpload}
                    >
                        {uploading ? (
                            <>
                                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
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

                {/* Step 2: AI Processing */}
                {uploadedFileIds.length > 0 && (
                    <div className="upload-ai-section animate-fade-in">
                        <h3>✨ Xử lý bằng AI</h3>
                        <p>Đặt tên cho bộ từ vựng (tùy chọn):</p>
                        <input
                            type="text"
                            placeholder="Vd: Business English, IELTS Vocab..."
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            disabled={processing}
                            onClick={handleProcess}
                        >
                            {processing ? (
                                <>
                                    <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                                    Đang xử lý AI... (có thể mất 30-60s)
                                </>
                            ) : (
                                <>
                                    <HiOutlineSparkles />
                                    Tạo Flashcard & Bài tập bằng AI
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Upload;
