const { query } = require('express');
var express = require('express');
const { default: mongoose } = require('mongoose');
var router = express.Router();
const Note = require('../models/note');

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
      create_time: {
        $gte: start_d, 
        $lte: end_d
      }
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
  res.render('newnote');
});

router.post('/newnote', async function(req, res, next) {
  const note = new Note({
    owner_id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    keywords: req.body.keywords.split(' '),
    content: req.body.content
  });

  await note.save();
  res.send('newnote created');
});

module.exports = router;
