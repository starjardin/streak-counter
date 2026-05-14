interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  className?: string
}

export const Button = ({ children, onClick, type = 'button', disabled = false, ref, className }: ButtonProps) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`cursor-pointer transition-colors duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className ?? ''}`}
    >
      {children}
    </button>
  );
};
