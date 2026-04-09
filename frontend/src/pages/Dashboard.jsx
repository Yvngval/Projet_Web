import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', date: '' });
    const [filters, setFilters] = useState({ search: '', status: '', date_from: '', date_to: '' });
    const [editingEvent, setEditingEvent] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', location: '', date: '', status: '' });
    const [participantsModal, setParticipantsModal] = useState(null); // { eventTitle, participants }
    const navigate = useNavigate();
    const canEdit = ['admin', 'editor'].includes(localStorage.getItem('role'));
    const isAdmin = localStorage.getItem('role') === 'admin';

    const fetchEvents = async (currentFilters) => {
        try {
            const f = currentFilters || filters;
            const params = {};
            if (f.search)    params.search    = f.search;
            if (f.status)    params.status    = f.status;
            if (f.date_from) params.date_from = f.date_from;
            if (f.date_to)   params.date_to   = f.date_to;
            const res = await api.get('events/', { params });
            setEvents(res.data.results || res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEvents(filters); }, [filters]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('events/', newEvent);
            setNewEvent({ title: '', description: '', location: '', date: '' });
            fetchEvents(filters);
        } catch (err) { alert("Erreur lors de la création."); }
    };

    const handleEditOpen = (event) => {
        setEditingEvent(event);
        setEditForm({
            title: event.title,
            description: event.description,
            location: event.location,
            date: event.date.slice(0, 16),
            status: event.status,
        });
    };

    const handleEditClose = () => setEditingEvent(null);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`events/${editingEvent.id}/`, editForm);
            setEditingEvent(null);
            fetchEvents(filters);
        } catch (err) { alert("Erreur lors de la modification."); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cet événement ?")) {
            try {
                await api.delete(`events/${id}/`);
                fetchEvents(filters);
            } catch (err) { alert("Action non autorisée."); }
        }
    };

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ search: '', status: '', date_from: '', date_to: '' });
    };

    const handleViewParticipants = async (event) => {
        try {
            const res = await api.get(`events/${event.id}/`);
            setParticipantsModal({
                eventTitle: event.title,
                participants: res.data.registered_participants || [],
            });
        } catch (err) { alert("Impossible de charger les inscrits."); }
    };

    const handleRemoveParticipant = async (registrationId) => {
        if (!window.confirm("Retirer ce participant de l'événement ?")) return;
        try {
            await api.delete(`registrations/${registrationId}/`);
            setParticipantsModal(prev => ({
                ...prev,
                participants: prev.participants.filter(p => p.registration_id !== registrationId),
            }));
        } catch (err) { alert("Erreur lors de la suppression."); }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = "/";
    };

    if (loading) return <div className="dash-loader">Chargement...</div>;

    return (
        <>
        <div className="dash-container">
            {/* HEADER */}
            <header className="dash-header">
                <h1 className="dash-logo"> TicketHub<span className="dash-badge"></span></h1>
                <div className="dash-header-actions">
                    <button onClick={() => navigate('/profile')} className="dash-profile-btn">Mon Profil</button>
                    <button onClick={logout} className="dash-logout-btn">Déconnexion</button>
                </div>
            </header>

            <div className="dash-content">
                {/* FORMULAIRE (Sidebar gauche) — visible admin/editor uniquement */}
                {canEdit && (
                <aside className="dash-sidebar">
                    <div className="dash-card">
                        <h3 className="dash-card-title">Nouvel Événement</h3>
                        <form onSubmit={handleCreate} className="dash-form">
                            <input className="dash-input" type="text" placeholder="Titre" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                            <textarea className="dash-textarea" placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required />
                            <input className="dash-input" type="text" placeholder="Lieu" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} required />
                            <input className="dash-input" type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
                            <button type="submit" className="dash-submit-btn">Créer</button>
                        </form>
                    </div>
                </aside>
                )}

                {/* LISTE (Grille droite) */}
                <main className="dash-main">
                    <h2 className="dash-section-title">Événements à venir ({events.length})</h2>

                    {/* BARRE DE FILTRES */}
                    <div className="dash-filter-bar">
                        <input
                            className="dash-filter-input"
                            type="text"
                            name="search"
                            placeholder="Rechercher par titre ou lieu..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                        <select className="dash-filter-select" name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="">Tous les statuts</option>
                            <option value="planned">Planifié</option>
                            <option value="ongoing">En cours</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                        <input
                            className="dash-filter-input"
                            type="datetime-local"
                            name="date_from"
                            title="Date de début"
                            value={filters.date_from}
                            onChange={handleFilterChange}
                        />
                        <input
                            className="dash-filter-input"
                            type="datetime-local"
                            name="date_to"
                            title="Date de fin"
                            value={filters.date_to}
                            onChange={handleFilterChange}
                        />
                        <button onClick={resetFilters} className="dash-reset-btn">Réinitialiser</button>
                    </div>

                    <div className="dash-grid">
                        {events.map(event => (
                            <div key={event.id} className="dash-event-card">
                                <div className="dash-event-body">
                                    <h4 className="dash-event-title">{event.title}</h4>
                                    <p className="dash-event-desc">{event.description}</p>
                                    <div className="dash-event-meta">
                                        <span>📍 {event.location}</span>
                                        <span>⏰ {new Date(event.date).toLocaleDateString()}</span>
                                        <span>👥 {event.participant_count ?? 0} inscrit{(event.participant_count ?? 0) !== 1 ? 's' : ''}</span>
                                    </div>
                                    {canEdit && (
                                        <button onClick={() => handleViewParticipants(event)} className="dash-participants-btn">
                                            Voir les inscrits
                                        </button>
                                    )}
                                </div>
                                {canEdit && <button onClick={() => handleEditOpen(event)} className="dash-edit-btn">✏️</button>}
                                {canEdit && <button onClick={() => handleDelete(event.id)} className="dash-delete-btn">🗑️</button>}
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>

        {/* MODAL D'ÉDITION */}
        {editingEvent && (
            <div className="dash-overlay">
                <div className="dash-modal">
                    <h3 className="dash-card-title">Modifier l'événement</h3>
                    <form onSubmit={handleUpdate} className="dash-form">
                        <input className="dash-input" type="text" placeholder="Titre" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required />
                        <textarea className="dash-textarea" placeholder="Description" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required />
                        <input className="dash-input" type="text" placeholder="Lieu" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} required />
                        <input className="dash-input" type="datetime-local" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} required />
                        <select className="dash-input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} required>
                            <option value="planned">Planifié</option>
                            <option value="ongoing">En cours</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                        <div className="dash-modal-actions">
                            <button type="submit" className="dash-submit-btn-flex">Enregistrer</button>
                            <button type="button" onClick={handleEditClose} className="dash-cancel-btn">Annuler</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        {/* MODAL INSCRITS */}
        {participantsModal && (
            <div className="dash-overlay">
                <div className="dash-modal-participants">
                    <h3 className="dash-card-title">
                        Inscrits — {participantsModal.eventTitle}
                        <span className="dash-participants-count">
                            ({participantsModal.participants.length} personne{participantsModal.participants.length !== 1 ? 's' : ''})
                        </span>
                    </h3>
                    <div className="dash-participants-list">
                        {participantsModal.participants.length === 0 ? (
                            <p className="dash-no-participants">Aucun inscrit pour cet événement.</p>
                        ) : (
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th className="dash-th">Nom</th>
                                        <th className="dash-th">Prénom</th>
                                        <th className="dash-th">Email</th>
                                        <th className="dash-th">Date d'inscription</th>
                                        {isAdmin && <th className="dash-th">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {participantsModal.participants.map(p => (
                                        <tr key={p.registration_id}>
                                            <td className="dash-td">{p.last_name}</td>
                                            <td className="dash-td">{p.first_name}</td>
                                            <td className="dash-td">{p.email}</td>
                                            <td className="dash-td">{new Date(p.registered_at).toLocaleDateString()}</td>
                                            {isAdmin && (
                                                <td className="dash-td">
                                                    <button
                                                        onClick={() => handleRemoveParticipant(p.registration_id)}
                                                        className="dash-remove-participant-btn"
                                                    >
                                                        Retirer
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <button onClick={() => setParticipantsModal(null)} className="dash-cancel-btn-close">Fermer</button>
                </div>
            </div>
        )}
        </>
    );
};

export default Dashboard;
