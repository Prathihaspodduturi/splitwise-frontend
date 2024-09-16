import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from './SplitwiseLoginPage.module.css';

const SplitwiseResetPasswordPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token'); 

    if (token) {
      navigate('/prathihas-splitwise/groups');
    }
  }, []);

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [otp, setOtp] = useState(''); // State to store the OTP entered by the user
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [otpSent, setOtpSent] = useState(false); // State to track if OTP has been sent

  const usernameRegex = /^[a-zA-Z0-9_]{5,15}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setError('');
    setConnectionError('');

    if (!usernameRegex.test(usernameOrEmail) && !emailRegex.test(usernameOrEmail)) {
      setError('Please enter a valid username or email.');
      setIsSubmitted(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/splitwise/reset-password/otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "usernameOrEmail": usernameOrEmail })
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data);
      }

      // OTP sent successfully
      //console.log('OTP sent successfully');
      setOtpSent(true); // Set the otpSent state to true
      setError('');
    } catch (error) {
      console.log(error.message);
      if (error.name === "TypeError" || error.message === "Failed to fetch") {
        setConnectionError("Unable to connect to the server. Please try again later.");
      } else {
        setIsSubmitted(false);
        setError(error.message);
      }
    }
    setIsSubmitted(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const response = await fetch("http://localhost:8080/splitwise/reset-password/verify", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "email": usernameOrEmail, "otp": otp })
        });

        const data = await response.text();

        if (!response.ok) {
            throw new Error(data);
        }

        // OTP verified successfully
        console.log('OTP verified successfully');
        navigate('/prathihas-splitwise/new-password');  // Redirect to new password page
    } catch (error) {
        console.log(error.message);
        if (error.name === "TypeError" || error.message === "Failed to fetch") {
            setConnectionError("Unable to connect to the server. Please try again later.");
        } else {
            setError(error.message);
        }
    }
};


  const handleCancel = () => {
    navigate('/prathihas-splitwise/login');
  };

  const handleCancelOtpSent = () => {
    setOtpSent(false);
  }

  if (connectionError) {
    return <div className={styles.errorMessage}>{connectionError}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {connectionError && (<div className={styles.error}>{connectionError}</div>)}
        {error && <div className={styles.error}>{error}</div>}
        {!connectionError && (
          <>
            <h1 className={styles.heading}>Reset Your Password</h1>
            {!otpSent ? (
              <>
                <p className={styles.para}>Enter your username or email for verification:</p>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="usernameOrEmail" className={styles.label}>Username/Email:</label>
                    <input
                      type="text"
                      id="usernameOrEmail"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.sendButton}>Send OTP</button>
                    <button type="button" className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <p className={styles.para}>OTP sent successfully. Please enter the OTP below:</p>
                <form onSubmit={handleOtpSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="otp" className={styles.label}>OTP:</label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.sendButton}>Verify OTP</button>
                    <button type="button" className={styles.cancelButton} onClick={handleCancelOtpSent}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SplitwiseResetPasswordPage;
