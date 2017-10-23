'use strict'

const Evernote = require('evernote')
const enAuth = require('./en-auth')

const debug = require('debug')('cg')

exports.notebooks = (token) => {
  const client = enAuth.createAuthenticatedClient(token)
  return client.getNoteStore().listNotebooks()
}

async function notesMetadata(guid, token) {
  const client = enAuth.createAuthenticatedClient(token)
  const noteStore = client.getNoteStore()

  const filter = new Evernote.NoteStore.NoteFilter()
  filter.notebookGuid = guid

  const noteCount = noteStore.findNoteCounts(token, filter)
  .then(count => count['notebookCounts'][filter.notebookGuid])
  .catch(err => err)

  const maxNotes = 50
  const offset = noteCount < maxNotes ? 0 : getRandomInt(0, noteCount-maxNotes)

  var spec = new Evernote.NoteStore.NotesMetadataResultSpec()
  for (var p in spec) { if (p.indexOf('include') !== -1) { spec[p] = true } }

  const notesMetadata = await noteStore.findNotesMetadata(filter, offset, maxNotes, spec)
  .then(notesMetadata => notesMetadata)
  .catch(err => [])

  const noteGuids = notesMetadata.notes.map(n => n.guid)
  const randomNoteIndex = getRandomInt(0, noteGuids.length)

  return noteStore.getNote(noteGuids[randomNoteIndex], true, true, true, true)
  .then(note => note).catch(err => err)
}

exports.notesMetadata = notesMetadata

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
