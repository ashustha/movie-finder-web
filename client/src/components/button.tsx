import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => {

    const buttonStyle: React.CSSProperties = {
        backgroundColor: '#4834D4',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
      };

      const iconStyle: React.CSSProperties = {
        marginRight: '5px', 
      };


  return (
    <button className={className} onClick={onClick} style={buttonStyle}>
      <FontAwesomeIcon icon={faPlay} style={iconStyle} /> {children}
    </button>
  );
};

export default Button;

