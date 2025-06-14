import React, { useState, useEffect } from 'https://cdn.skypack.dev/react';
import { render } from 'https://cdn.skypack.dev/react-dom';

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

const Field = ({ label, type, name, pattern, errorMsg, onValid }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const validate = val => {
    const regex = new RegExp(pattern);
    const valid = regex.test(val);
    setError(valid ? '' : errorMsg);
    setIsValid(valid);
    if (valid) onValid();
  };

  const handleChange = e => {
    setValue(e.target.value);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => validate(e.target.value), 500));
  };

  return (
    <fieldset>
      <label htmlFor={name}>{label}</label>
      {(error && <span className="error ri-close-circle-fill"></span>) ||
        (isValid && <span className="success ri-checkbox-circle-fill"></span>)}
      <input type={type} id={name} name={name} value={value} onChange={handleChange} />
      {error && <span className="error-text">{error}</span>}
    </fieldset>
  );
};

const SignupForm = () => {
  const [validFields, setValidFields] = useState([]);

  const markValid = field => {
    setValidFields(prev => (prev.includes(field) ? prev : [...prev, field]));
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
        />
        {validFields.includes('name') && (
          <Field
            label="Email"
            type="email"
            name="email"
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            errorMsg="Invalid email format"
            onValid={() => markValid('email')}
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
          />
        )}
        {validFields.includes('address') && <button type="submit">Sign Up</button>}
      </form>
    </>
  );
};

render(<SignupForm />, document.getElementById('app'));
