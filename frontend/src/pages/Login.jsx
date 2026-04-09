import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('auth/login/', { username, password });
            localStorage.setItem('token', res.data.access);
            const me = await api.get('auth/me/');
            localStorage.setItem('role', me.data.role);
            navigate('/dashboard');
        } catch (err) {
            alert("Identifiants incorrects");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-logo">TicketHub</h1>
                    <p className="login-subtitle">Connectez-vous pour gérer vos événements</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <label className="login-label">Nom d'utilisateur</label>
                        <input
                            className="login-input"
                            type="text"
                            placeholder="ex: admin"
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Mot de passe</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="••••••••"
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">Se connecter</button>
                </form>
                <p className="login-footer-text">
                    Pas encore de compte ? <Link to="/register" className="login-link">Inscrivez-vous ici</Link>
                </p>

                <div className="login-footer">
                    <p></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
