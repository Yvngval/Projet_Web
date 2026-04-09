import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ROLE_LABELS = {
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Spectateur',
};

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [pwMessage, setPwMessage] = useState(null); // { type: 'success'|'error', text }

    useEffect(() => {
        api.get('auth/me/')
            .then(res => setUser(res.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handlePwChange = async (e) => {
        e.preventDefault();
        setPwMessage(null);

        if (pwForm.new_password !== pwForm.confirm_password) {
            setPwMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        try {
            await api.post('auth/change-password/', {
                old_password: pwForm.old_password,
                new_password: pwForm.new_password,
            });
            setPwMessage({ type: 'success', text: 'Mot de passe modifié avec succès.' });
            setPwForm({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.old_password?.[0] || data?.new_password?.[0] || data?.detail || 'Une erreur est survenue.';
            setPwMessage({ type: 'error', text: msg });
        }
    };

    if (loading) return <div className="dash-loader">Chargement...</div>;

    return (
        <div className="prof-container">
            <div className="prof-wrapper">
                <div className="prof-header">
                    <button onClick={() => navigate('/dashboard')} className="prof-back-btn">← Retour au Dashboard</button>
                    <h1 className="prof-title">Mon Profil</h1>
                </div>

                {/* INFOS */}
                <div className="prof-card">
                    <h2 className="prof-card-title">Mes informations</h2>
                    <div className="prof-info-grid">
                        <div className="prof-info-item">
                            <span className="prof-info-label">Nom d'utilisateur</span>
                            <span className="prof-info-value">{user.username}</span>
                        </div>
                        <div className="prof-info-item">
                            <span className="prof-info-label">Email</span>
                            <span className="prof-info-value">{user.email || '—'}</span>
                        </div>
                        <div className="prof-info-item">
                            <span className="prof-info-label">Rôle</span>
                            <span className="prof-info-value">
                                <span className={`prof-role-badge prof-role-${user.role}`}>
                                    {ROLE_LABELS[user.role] || user.role}
                                </span>
                            </span>
                        </div>
                        <div className="prof-info-item">
                            <span className="prof-info-label">Membre depuis</span>
                            <span className="prof-info-value">
                                {new Date(user.date_joined).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* MOT DE PASSE */}
                <div className="prof-card">
                    <h2 className="prof-card-title">Changer le mot de passe</h2>
                    <form onSubmit={handlePwChange} className="prof-form">
                        <div className="prof-field">
                            <label className="prof-label">Mot de passe actuel</label>
                            <input
                                className="prof-input"
                                type="password"
                                value={pwForm.old_password}
                                onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="prof-field">
                            <label className="prof-label">Nouveau mot de passe</label>
                            <input
                                className="prof-input"
                                type="password"
                                value={pwForm.new_password}
                                onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="prof-field">
                            <label className="prof-label">Confirmer le nouveau mot de passe</label>
                            <input
                                className="prof-input"
                                type="password"
                                value={pwForm.confirm_password}
                                onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                                required
                                minLength={8}
                            />
                        </div>
                        {pwMessage && (
                            <div className={`prof-message prof-message-${pwMessage.type}`}>
                                {pwMessage.text}
                            </div>
                        )}
                        <button type="submit" className="prof-btn">Modifier le mot de passe</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
