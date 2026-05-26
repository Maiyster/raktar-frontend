import React, { useState, useContext } from 'react';
import { loginUser } from '../../api/authService';
import { AuthContext } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await loginUser(formData);
            login(userData); 
        } catch (err) {
            setError('Hibás bejelentkezési adatok vagy hálózati hiba.');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Raktár Bejelentkezés</h2>
                {error && <div className={styles.error}>{error}</div>}
                
                <div className={styles.inputGroup}>
                    <label>Felhasználónév</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} />
                </div>
                
                <div className={styles.inputGroup}>
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className={styles.inputGroup}>
                    <label>Jelszó</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>

                <button type="submit" className={styles.submitBtn}>Bejelentkezés</button>
            </form>
        </div>
    );
};

export default Login;