import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlineDocument } from 'react-icons/hi';
import './FileUploadZone.css';

const ACCEPT = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/plain': ['.txt'],
    'application/rtf': ['.rtf'],
    'text/rtf': ['.rtf'],
};

function FileUploadZone({ files, setFiles }) {
    const [errorMsg, setErrorMsg] = useState(null);
    const onDrop = useCallback((acceptedFiles) => {
        setErrorMsg(null);
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, [setFiles]);

    const onDropRejected = useCallback((fileRejections) => {
        const file = fileRejections[0]?.file;
        const errCode = fileRejections[0]?.errors[0]?.code;
        
        if (errCode === 'file-too-large') {
            setErrorMsg(`File "${file?.name}" quá lớn. Vui lòng chọn file dưới 100MB.`);
        } else if (errCode === 'file-invalid-type') {
            setErrorMsg(`File "${file?.name}" không đúng định dạng hỗ trợ.`);
        } else {
            setErrorMsg(`Không thể tải lên file "${file?.name}". Lỗi: ${errCode}`);
        }
    }, []);

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: ACCEPT,
        maxSize: 100 * 1024 * 1024,
    });

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="upload-zone-wrapper">
            {errorMsg && (
                <div className="upload-error-alert" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca' }}>
                    {errorMsg}
                </div>
            )}
            
            {files.length === 0 && (
                <div
                    {...getRootProps()}
                    className={`upload-dropzone ${isDragActive ? 'upload-dropzone--active' : ''}`}
                >
                    <input {...getInputProps()} />
                    <div className="upload-dropzone-content">
                        <HiOutlineCloudUpload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-title">
                            {isDragActive ? 'Thả file vào đây...' : 'Kéo & thả file vào đây'}
                        </p>
                        <p className="upload-dropzone-subtitle">
                            hoặc <span>click để chọn file</span>
                        </p>
                        <p className="upload-dropzone-hint">
                            Hỗ trợ: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, TXT, RTF (tối đa 100MB)
                        </p>
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className="upload-file-list">
                    <h3 className="upload-file-list-title">
                        File đã chọn ({files.length})
                    </h3>
                    {files.map((file, index) => (
                        <div key={index} className="upload-file-item">
                            <HiOutlineDocument className="upload-file-item-icon" />
                            <div className="upload-file-item-info">
                                <span className="upload-file-item-name">{file.name}</span>
                                <span className="upload-file-item-size">{formatSize(file.size)}</span>
                            </div>
                            <button
                                className="upload-file-item-remove"
                                onClick={() => removeFile(index)}
                            >
                                <HiOutlineX />
                            </button>
                        </div>
                    ))}
                    <button
                        className="btn btn-secondary upload-add-more"
                        onClick={() => document.getElementById('file-input-trigger')?.click()}
                    >
                        + Thêm file
                    </button>
                    <input
                        id="file-input-trigger"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            setErrorMsg(null);
                            const selectedFiles = Array.from(e.target.files || []);
                            
                            // Thủ công kiểm tra dung lượng cho thẻ input hidden
                            const tooLarge = selectedFiles.find(f => f.size > 100 * 1024 * 1024);
                            if (tooLarge) {
                                setErrorMsg(`File "${tooLarge.name}" quá lớn. Vui lòng chọn file dưới 100MB.`);
                                e.target.value = '';
                                return;
                            }
                            
                            if (selectedFiles.length) {
                                setFiles((prev) => [...prev, ...selectedFiles]);
                                e.target.value = '';
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default FileUploadZone;
