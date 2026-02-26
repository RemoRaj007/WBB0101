import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, className, ...props }) => {
    return (
        <div className="form-group">
            <label className="form-label">
                {label}
            </label>
            <input
                className={`form-input ${className || ''}`}
                {...props}
            />
        </div>
    );
};
