var express = require('express');
const { default: mongoose } = require('mongoose');
var router = express.Router();
const Note = require('../models/note');
const config = require('../config.json');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const authed = req.isAuthenticated();
  let start_date = '';
  let end_date = '';
  let notes = [];

  if (authed) {
    let end_d = new Date();
    let start_d = new Date(end_d.getTime() - (60*60*24*7*1000));
    if (req.query.start_date) {
      const dd = req.query.start_date.split('-');
      start_d = new Date(dd[0], dd[1]-1, dd[2]);
    }
    if (req.query.end_date) {
      const dd = req.query.end_date.split('-');
      end_d = new Date(dd[0], dd[1]-1, dd[2]);
    }
  
    notes = await Note.find({
      owner_id: req.user.id,
      create_time: {
        $gte: start_d, 
        $lte: end_d
      }
    })
    .limit(config.mongo.query_limit)
    .sort({update_time: 'desc'});

    notes.forEach((nt) => {
      nt.show_time = nt.update_time.toLocaleString();
    });

    res.render('index', {
      authed: authed,
      start_date: start_d.toISOString().split('T')[0],
      end_date: end_d.toISOString().split('T')[0],
      note: notes
    });
  }
  else {
    res.render('index', {
      authed: authed
    });
  }
});

router.get('/newnote', async function(req, res, next) {
  if (req.isAuthenticated()) {
    res.render('newnote', {authed: true});
  }
  else {
    res.redirect('/users/login');
  }
  
});

router.post('/newnote', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/users/login');
    return;
  }

  if (!req.body.title || !req.body.content) {
    res.send('invalid note');
    return;
  }

  const note = new Note({
    owner_id: req.user.id,
    title: req.body.title,
    keywords: req.body.keywords.split(' '),
    content: req.body.content
  });

  const notep = await note.save();
  res.redirect('/note/' + notep._id);
});

router.get('/note/:nid', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/users/login');
    return;
  }

  const note = await Note.findById(req.params.nid);
  if (!note) {
    res.send('no such note');
    return;
  }

  res.render('notepresent', {authed: true, note: note});
});

router.get('/noteedit/:nid', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/users/login');
    return;
  }

  const note = await Note.findById(req.params.nid).exec();
  if (!note) {
    res.send('no such note');
    return;
  }

  res.render('noteedit', {authed: true, note: note});
});

router.post('/updatenote', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/users/login');
    return;
  }

  const result = await Note.updateOne({_id: req.body.noteId}, { 
    title: req.body.title,
    keywords: req.body.keywords.split(' '),
    content: req.body.content,
    update_time: new Date()
  });

  if (result.modifiedCount != 1) {
    res.send('no such note');
    return;
  }
  
  res.redirect('/note/' + req.body.noteId);
});

router.get('/notedel/:nid', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/users/login');
    return;
  }

  await Note.findByIdAndDelete(req.params.nid);
  res.redirect('/');
});

module.exports = router;
