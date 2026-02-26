import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => {
    return (
        <button
            className={`btn btn-${variant} ${className || ''}`}
            {...props}
        />
    );
};
