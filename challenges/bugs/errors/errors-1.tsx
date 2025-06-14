import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import { render } from 'https://cdn.skypack.dev/react-dom';

// Snarky remarks for each step
const messages = [
  'Really? Your name is Bozo? 🙄',
  'Is this even a real email? 🤨',
  'You expect me to believe you have a strong password? 😒',
  'Come on, is this your phone number or what? 📱',
  'Your address is a joke, right? 😑',
];

// Theme button to toggle dark/light mode
const ThemeButton = () => {
  const [darkTheme, setDarkTheme] = useState(true);
  const icon = darkTheme ? 'moon' : 'sun';

  useEffect(() => {
    document.body.classList.toggle('dark', darkTheme);
    document.body.classList.toggle('light', !darkTheme);
  }, [darkTheme]);

  const className = `icon ri-${icon}-fill`;
  return <button onClick={() => setDarkTheme(!darkTheme)} className={className}></button>;
};

// Field component for form input with validation and snarky remarks
const Field = ({
  label,
  type,
  name,
  pattern,
  errorMsg,
  onValid,
  remarkIndex,
}: {
  label: string;
  type: string;
  name: string;
  pattern: string;
  errorMsg: string;
  onValid: () => void;
  remarkIndex: number;
}) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Validate input based on pattern
  const validate = (val: string) => {
    const regex = new RegExp(pattern);
    const valid = regex.test(val);
    setError(valid ? '' : errorMsg);
    setIsValid(valid);
    if (valid) onValid(); // Notify parent that the field is valid
  };

  // Handle input change and debounce the validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => validate(e.target.value), 500));
  };

  return (
    <fieldset>
      <label htmlFor={name}>{label}</label>
      <input type={type} id={name} name={name} value={value} onChange={handleChange} />
      <p className="error-text">{error && error}</p>
      {/* Display the snarky remark if valid */}
      {isValid && <p className="agent-message">{messages[remarkIndex]}</p>}
    </fieldset>
  );
};

// Main SignupForm component
const SignupForm = () => {
  const [validFields, setValidFields] = useState<string[]>([]);

  const markValid = (field: string) => {
    if (!validFields.includes(field)) {
      setValidFields(prev => [...prev, field]);
    }
  };

  return (
    <>
      <ThemeButton />
      <form>
        <Field
          label="Name"
          type="text"
          name="name"
          pattern="^[A-Za-z ]{3,}$"
          errorMsg="Must be at least 3 letters"
          onValid={() => markValid('name')}
          remarkIndex={0}
        />
        {validFields.includes('name') && (
          <Field
            label="Email"
            type="email"
            name="email"
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            errorMsg="Invalid email format"
            onValid={() => markValid('email')}
            remarkIndex={1}
          />
        )}
        {validFields.includes('email') && (
          <Field
            label="Password"
            type="password"
            name="password"
            pattern="^(?=.*[A-Z])(?=.*\d).{6,}$"
            errorMsg="Min 6 chars, 1 uppercase, 1 number"
            onValid={() => markValid('password')}
            remarkIndex={2}
          />
        )}
        {validFields.includes('password') && (
          <Field
            label="Phone Number"
            type="tel"
            name="phone"
            pattern="^\d{10,15}$"
            errorMsg="Must be 10-15 digits"
            onValid={() => markValid('phone')}
            remarkIndex={3}
          />
        )}
        {validFields.includes('phone') && (
          <Field
            label="Address"
            type="text"
            name="address"
            pattern="^.{5,}$"
            errorMsg="Must be at least 5 characters"
            onValid={() => markValid('address')}
            remarkIndex={4}
          />
        )}
        {validFields.includes('address') && <button type="submit">Sign Up</button>}
      </form>
    </>
  );
};

// Render the SignupForm
render(<SignupForm />, document.getElementById('app'));
