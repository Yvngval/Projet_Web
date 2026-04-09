import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // On envoie les données à l'URL d'inscription
            await api.post('auth/register/', formData);
            alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
            navigate('/'); // On redirige vers le Login
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'inscription. L'utilisateur existe peut-être déjà.");
        }
    };

    return (
        <div className="reg-container">
            <div className="reg-card">
                <div className="reg-header">
                    <h1 className="reg-logo">TicketHub</h1>
                    <p className="reg-subtitle">Créez votre compte pour gérer vos événements</p>
                </div>

                <form onSubmit={handleSubmit} className="reg-form">
                    <div className="reg-row">
                        <input
                            className="reg-input"
                            type="text"
                            placeholder="Prénom"
                            onChange={e => setFormData({...formData, first_name: e.target.value})}
                            required
                        />
                        <input
                            className="reg-input"
                            type="text"
                            placeholder="Nom"
                            onChange={e => setFormData({...formData, last_name: e.target.value})}
                            required
                        />
                    </div>
                    <input
                        className="reg-input"
                        type="text"
                        placeholder="Nom d'utilisateur"
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        required
                    />
                    <input
                        className="reg-input"
                        type="email"
                        placeholder="Email"
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                    />
                    <input
                        className="reg-input"
                        type="password"
                        placeholder="Mot de passe"
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                    />

                    <button type="submit" className="reg-btn">S'inscrire</button>
                </form>

                <p className="reg-footer-text">
                    Déjà un compte ? <Link to="/" className="reg-link">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
