import { createPortal } from 'react-dom';
import { HiOutlineX, HiOutlineSave } from 'react-icons/hi';
import './FlashcardModal.css';

function FlashcardModal({ open, mode, card, onSave, onClose }) {
    const isEdit = mode === 'edit';
    const [formData, setFormData] = React.useState(() => ({
        word: card?.word || '',
        pronunciation: card?.pronunciation || '',
        definition: card?.definition || '',
        translation: card?.translation || '',
        example_sentence: card?.example_sentence || ''
    }));

    React.useEffect(() => {
        if (open) {
            setFormData({
                word: card?.word || '',
                pronunciation: card?.pronunciation || '',
                definition: card?.definition || '',
                translation: card?.translation || '',
                example_sentence: card?.example_sentence || ''
            });
        }
    }, [open, card]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.word.trim()) return;
        onSave({ ...formData, id: card?.id });
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return createPortal(
        <div className="flashcard-modal-overlay" onClick={onClose}>
            <div className="flashcard-modal animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flashcard-modal-header">
                    <h3>{isEdit ? 'Chỉnh sửa từ vựng' : 'Thêm từ mới'}</h3>
                    <button className="flashcard-modal-close" onClick={onClose}>
                        <HiOutlineX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flashcard-modal-form">
                    <div className="flashcard-modal-field">
                        <label>Từ vựng <span className="required">*</span></label>
                        <input
                            type="text"
                            value={formData.word}
                            onChange={e => handleChange('word', e.target.value)}
                            placeholder="Nhập từ vựng"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flashcard-modal-field">
                        <label>Phiên âm</label>
                        <input
                            type="text"
                            value={formData.pronunciation}
                            onChange={e => handleChange('pronunciation', e.target.value)}
                            placeholder="IPA hoặc phiên âm"
                        />
                    </div>

                    <div className="flashcard-modal-field">
                        <label>Định nghĩa</label>
                        <textarea
                            value={formData.definition}
                            onChange={e => handleChange('definition', e.target.value)}
                            placeholder="Định nghĩa tiếng Anh"
                            rows={2}
                        />
                    </div>

                    <div className="flashcard-modal-field">
                        <label>Dịch tiếng Việt</label>
                        <input
                            type="text"
                            value={formData.translation}
                            onChange={e => handleChange('translation', e.target.value)}
                            placeholder="Dịch tiếng Việt"
                        />
                    </div>

                    <div className="flashcard-modal-field">
                        <label>Ví dụ</label>
                        <textarea
                            value={formData.example_sentence}
                            onChange={e => handleChange('example_sentence', e.target.value)}
                            placeholder="Câu ví dụ"
                            rows={2}
                        />
                    </div>

                    <div className="flashcard-modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!formData.word.trim()}>
                            <HiOutlineSave />
                            {isEdit ? 'Lưu thay đổi' : 'Thêm từ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

import React from 'react';

export default FlashcardModal;
