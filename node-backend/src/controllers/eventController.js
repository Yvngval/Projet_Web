const { Op } = require('sequelize');
const { Event, Registration, Participant, User } = require('../models');

async function list(req, res, next) {
  try {
    const { search, status, date_from, date_to } = req.query;
    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    if (date_from || date_to) {
      where.date = {};
      if (date_from) where.date[Op.gte] = new Date(date_from);
      if (date_to) where.date[Op.lte] = new Date(date_to);
    }
    const events = await Event.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: Registration, attributes: ['id'] },
      ],
      order: [['date', 'ASC']],
    });
    const result = events.map((e) => ({
      ...e.toJSON(),
      participant_count: e.Registrations.length,
    }));
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, description, date, location, status } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: true, message: 'title et date sont requis' });
    }
    if (new Date(date) <= new Date()) {
      return res.status(400).json({ error: true, message: 'La date doit être dans le futur' });
    }
    const event = await Event.create({
      title, description, date, location, status, created_by_id: req.user.id,
    });
    return res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        {
          model: Registration,
          include: [{ model: Participant, attributes: ['id', 'first_name', 'last_name', 'email'] }],
        },
      ],
    });
    if (!event) return res.status(404).json({ error: true, message: 'Événement introuvable' });
    const registered_participants = event.Registrations.map(r => ({
      registration_id: r.id,
      first_name: r.Participant?.first_name,
      last_name: r.Participant?.last_name,
      email: r.Participant?.email,
      registered_at: r.registered_at,
    }));
    return res.json({ ...event.toJSON(), participant_count: event.Registrations.length, registered_participants });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: true, message: 'Événement introuvable' });
    const { title, description, date, location, status } = req.body;
    if (date && new Date(date) <= new Date()) {
      return res.status(400).json({ error: true, message: 'La date doit être dans le futur' });
    }
    if (status === 'cancelled' && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Seul un admin peut annuler un événement' });
    }
    await event.update({ title, description, date, location, status });
    return res.json(event);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: true, message: 'Événement introuvable' });
    await Registration.destroy({ where: { event_id: event.id } });
    await event.destroy();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: true, message: 'Événement introuvable' });
    if (event.status === 'cancelled') {
      return res.status(400).json({ error: true, message: "Impossible de s'inscrire à un événement annulé" });
    }
    const user = await User.findByPk(req.user.id);
    let participant = await Participant.findOne({ where: { email: user.email } });
    if (!participant) {
      participant = await Participant.create({
        first_name: user.username,
        last_name: '',
        email: user.email,
      });
    }
    const existing = await Registration.findOne({
      where: { event_id: event.id, participant_id: participant.id },
    });
    if (existing) {
      return res.status(409).json({ error: true, message: 'Vous êtes déjà inscrit à cet événement' });
    }
    const reg = await Registration.create({ event_id: event.id, participant_id: participant.id });
    return res.status(201).json(reg);
  } catch (err) {
    next(err);
  }
}

async function unregister(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: true, message: 'Événement introuvable' });
    const user = await User.findByPk(req.user.id);
    const participant = await Participant.findOne({ where: { email: user.email } });
    if (!participant) return res.status(404).json({ error: true, message: 'Participant introuvable' });
    const reg = await Registration.findOne({
      where: { event_id: event.id, participant_id: participant.id },
    });
    if (!reg) return res.status(404).json({ error: true, message: 'Inscription introuvable' });
    await reg.destroy();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function myRegistrations(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    const participant = await Participant.findOne({ where: { email: user.email } });
    if (!participant) return res.json({});
    const regs = await Registration.findAll({ where: { participant_id: participant.id } });
    const map = {};
    regs.forEach(r => { map[r.event_id] = r.id; });
    return res.json(map);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getOne, update, remove, register, unregister, myRegistrations };
