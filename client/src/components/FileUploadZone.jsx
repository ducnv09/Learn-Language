import { useCallback } from 'react';
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
};

function FileUploadZone({ files, setFiles }) {
    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, [setFiles]);

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPT,
        maxSize: 20 * 1024 * 1024,
    });

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="upload-zone-wrapper">
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
                            Hỗ trợ: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX (tối đa 20MB)
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
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            if (e.target.files?.length) {
                                setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
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
