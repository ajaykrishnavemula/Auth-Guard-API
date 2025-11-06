import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-start cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              className="sr-only peer"
              {...props}
            />
            <div
              className={`w-5 h-5 border-2 rounded transition-all peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2 ${
                error ? 'border-red-500' : 'border-gray-300 group-hover:border-gray-400'
              } ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            >
              <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          {label && (
            <span
              className={`ml-2 text-sm ${
                props.disabled ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              {label}
            </span>
          )}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;


