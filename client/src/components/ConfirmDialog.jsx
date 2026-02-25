import { createPortal } from 'react-dom';
import { HiOutlineExclamation } from 'react-icons/hi';
import './ConfirmDialog.css';

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText, cancelText, danger }) {
    if (!open) return null;

    return createPortal(
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-icon ${danger ? 'confirm-icon--danger' : ''}`}>
                    <HiOutlineExclamation />
                </div>
                <h3 className="confirm-title">{title || 'Xác nhận'}</h3>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>
                        {cancelText || 'Hủy'}
                    </button>
                    <button
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmText || 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmDialog;
