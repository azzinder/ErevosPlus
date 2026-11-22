// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Chat with myself (lock/myself-data.ts): each space's and each hidden place's notes apart, sealed
// so no other key reads them; a note's reminder set, changed, taken away and seen; what the home
// screen's row shows of them; a note deleted with its photo's chunks and its voice message; and a
// hidden place's reminders told by the phone only while that place receives closed; and the folders,
// made, renamed and deleted, here and on the account's other devices.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { reminders, seen } from './device-memory';
import { blobs, files } from './files-memory';
import { bytesSource, keepFile } from '../lib/attachments';
import { randomBytes } from '../lib/crypto';
import { armPlaceReminders, deleteNote, myNotes, remindAt, seenReminders, writeNote } from '../lib/myself';
import { setCurrentSpace } from '../lock/keys';
import { encodeOne, Parts } from '../lib/link-wire';
import {
  addFolder,
  addNote,
  changeFolder,
  changeNote,
  FILE,
  folderName,
  foldersOf,
  isDue,
  isWaiting,
  leftFolders,
  loadFolders,
  loadNotes,
  markTold,
  MAX_FOLDER_NAME,
  MAX_FOLDERS,
  mergeNotes,
  newNoteId,
  notesSince,
  notesSummary,
  onNotesCame,
  onNotesWritten,
  removeNote,
  setNoteFile,
  stampOf,
  type NoteCame,
  type NotesPlace,
} from '../lock/myself-data';
import { saveClip } from '../lock/voice-clips';

const place = (holder: NotesPlace['holder'] = 'space', space = 0, key = randomBytes(32)): NotesPlace => ({ holder, space, key });
const note = (text: string, at = Date.now(), more = {}) => ({ id: newNoteId(), at, text, ...more });

test("a space's notes are its own: the oldest first, sealed, and apart from another space's and its hidden places'", async () => {
  files.clear();
  blobs.clear();
  const mine = place();
  const other = place('space', 1);
  const hidden = place('hidden', 0);
  await addNote(mine, note('first', 1000));
  await addNote(mine, note('second', 2000));
  await addNote(other, note('elsewhere'));
  await addNote(hidden, note('hidden'));
  assert.deepEqual((await loadNotes(mine)).map((n) => n.text), ['first', 'second']);
  assert.deepEqual((await loadNotes(other)).map((n) => n.text), ['elsewhere']);
  assert.deepEqual((await loadNotes(hidden)).map((n) => n.text), ['hidden']);
  // Another key finds nothing there, and the file says nothing of the words.
  assert.deepEqual(await loadNotes({ ...mine, key: randomBytes(32) }), []);
  assert.ok(!files.get(FILE)?.includes(JSON.stringify('first')));
});

test('a reminder is set, changed, taken away and seen; the home row counts those that came', async () => {
  files.clear();
  const mine = place();
  const now = 10_000_000;
  const soon = await addNote(mine, note('call the bank', now - 5000, { due: now + 60_000 }));
  const past = await addNote(mine, note('water the plants', now - 4000, { due: now - 1000 }));
  await addNote(mine, note('just a note', now - 3000));
  let notes = await loadNotes(mine);
  assert.ok(isWaiting(notes[0], now) && !isDue(notes[0], now));
  assert.ok(isDue(notes[1], now));
  let summary = notesSummary(notes, now);
  assert.equal(summary.last?.text, 'just a note');
  assert.deepEqual(summary.due.map((n) => n.text), ['water the plants']);
  assert.equal(summary.next, now + 60_000);
  // Seen: no longer counted, and it does not come again.
  await markTold(mine, [past.id]);
  notes = await loadNotes(mine);
  assert.equal(notesSummary(notes, now).due.length, 0);
  assert.ok(!isWaiting(notes[1], now));
  // A new time for a seen one makes it remind again; taking it away leaves the note.
  await changeNote(mine, past.id, { due: now + 120_000 });
  assert.ok(isWaiting((await loadNotes(mine))[1], now));
  await changeNote(mine, soon.id, { due: null });
  notes = await loadNotes(mine);
  assert.equal(notes[0].due, undefined);
  assert.equal(notes[0].text, 'call the bank');
  assert.equal(notesSummary(notes, now).next, now + 120_000);
  assert.equal(await changeNote(mine, newNoteId(), { due: now }), null);
});

test('reminders seen in the chat are told to the phone, which takes them out of its notice; only those that came', async () => {
  files.clear();
  seen.clear();
  setCurrentSpace(0, randomBytes(32));
  try {
    const now = Date.now();
    await writeNote({ text: 'came', due: now - 1000 });
    const waiting = await writeNote({ text: 'later', due: now + 3_600_000 });
    const came = (await myNotes()).find((n) => n.text === 'came')!;
    await seenReminders(await myNotes(), now);
    assert.deepEqual([...seen], [came.id]);
    assert.ok(!seen.has(waiting.id));
    // Seen once: nothing again.
    seen.clear();
    await seenReminders(await myNotes(), now);
    assert.deepEqual([...seen], []);
  } finally {
    setCurrentSpace(null);
  }
});

test('a note deleted takes its photo or file and its voice message with it', async () => {
  files.clear();
  blobs.clear();
  const mine = place();
  const file = await keepFile(bytesSource(randomBytes(3000)), { name: 'a.jpg', mime: 'image/jpeg', kind: 'photo' });
  const voice = await saveClip(randomBytes(500), 2000);
  const withFile = await addNote(mine, note('', Date.now(), { file }));
  const withVoice = await addNote(mine, note('', Date.now(), { voice }));
  assert.ok([...blobs.keys()].some((name) => name.includes(file.id)));
  assert.ok([...blobs.keys()].some((name) => name.includes(voice.id)));
  assert.equal((await removeNote(mine, withFile.id))?.id, withFile.id);
  await removeNote(mine, withVoice.id);
  assert.ok(![...blobs.keys()].some((name) => name.includes(file.id) || name.includes(voice.id)));
  assert.deepEqual(await loadNotes(mine), []);
  assert.equal(await removeNote(mine, withFile.id), null);
});

test("a hidden place's reminders are told by the phone only while it receives closed; the space's always are", async () => {
  files.clear();
  blobs.clear();
  reminders.clear();
  setCurrentSpace(0, randomBytes(32));
  try {
    const later = Date.now() + 3_600_000;
    const own = await writeNote({ text: 'space', due: later });
    assert.equal(reminders.get(own.id), later);
    const hidden = place('hidden1');
    const closed = { place: hidden, arm: false };
    const kept = await writeNote({ text: 'hidden', due: later }, closed);
    assert.ok(!reminders.has(kept.id));
    assert.deepEqual((await myNotes()).map((n) => n.text), ['space']);
    assert.deepEqual((await myNotes(closed)).map((n) => n.text), ['hidden']);

    // Its switch on, what is still to come is told; off, no longer, and the space's stays.
    await armPlaceReminders(hidden, true);
    assert.equal(reminders.get(kept.id), later);
    await armPlaceReminders(hidden, false);
    assert.ok(!reminders.has(kept.id));
    assert.equal(reminders.get(own.id), later);

    // While it receives, a time set is told; while it does not, it is not.
    const receiving = { place: hidden, arm: true };
    await remindAt(kept.id, later + 1000, receiving);
    assert.equal(reminders.get(kept.id), later + 1000);
    await remindAt(kept.id, later + 2000, closed);
    assert.ok(!reminders.has(kept.id));
    assert.equal((await myNotes(closed))[0].due, later + 2000);

    // Deleted there, the space's note stays.
    await deleteNote(kept.id, closed);
    assert.deepEqual(await myNotes(closed), []);
    assert.deepEqual((await myNotes()).map((n) => n.text), ['space']);
  } finally {
    setCurrentSpace(null);
  }
});

test("what goes to the account's other devices: every note once, then only what was changed here, by stamp", async () => {
  const mine = place();
  const written: string[] = [];
  const stop = onNotesWritten((p) => p === mine && written.push('w'));
  try {
    const a = await addNote(mine, note('a', 1000));
    const b = await addNote(mine, note('b', 2000));
    assert.equal(written.length, 2);
    assert.ok(stampOf(b) > stampOf(a));
    // Every note, to a device told none yet.
    assert.deepEqual((await notesSince(mine, 0, true)).notes.map((n) => n.text), ['a', 'b']);
    const told = stampOf(b);
    assert.deepEqual((await notesSince(mine, told, false)).notes, []);
    // A reminder set, then a note deleted: each after, in that order.
    await changeNote(mine, a.id, { due: 5000 });
    await removeNote(mine, b.id);
    const after = await notesSince(mine, told, false);
    assert.deepEqual(after.notes.map((n) => [n.id, n.due]), [[a.id, 5000]]);
    assert.deepEqual(after.gone.map((g) => g.id), [b.id]);
    assert.ok(after.gone[0].v > stampOf(after.notes[0]));
    // Seen: each its own stamp.
    const c = await addNote(mine, note('c', 3000, { due: 10 }));
    const before = stampOf(c);
    await markTold(mine, [a.id, c.id]);
    const seen = (await notesSince(mine, before, false)).notes;
    assert.equal(new Set(seen.map(stampOf)).size, 2);
  } finally {
    stop();
  }
});

test('notes from another device: the later change of each stays, a deleted one stays deleted, and nothing goes back to them', async () => {
  const mine = place();
  const written: number[] = [];
  const came: string[][] = [];
  const stopWritten = onNotesWritten((p) => p === mine && written.push(1));
  const stopCame = onNotesCame((p, changed, gone) => p === mine && came.push([...changed.map((n) => n.id), ...gone.map((id) => `-${id}`)]));
  try {
    const kept = await addNote(mine, note('here', 1000));
    const made: string[] = [];
    const from = (id: string, text: string, v: number, more = {}): NoteCame => ({
      note: { id, at: 500, text, v, ...more },
      make: async () => {
        made.push(id);
        return {};
      },
    });
    const other = newNoteId();
    // A new one comes, in its place by when it was written; an older change to one kept here does not.
    let result = await mergeNotes(mine, [from(other, 'there', 10), from(kept.id, 'old words', 1)], []);
    assert.deepEqual(result.changed.map((n) => n.id), [other]);
    assert.deepEqual((await loadNotes(mine)).map((n) => n.text), ['there', 'here']);
    assert.deepEqual(made, [other]);
    // A later change takes the words and the reminder, and makes nothing again.
    await mergeNotes(mine, [from(other, 'there, changed', 20, { due: 9000 })], []);
    const changed = (await loadNotes(mine)).find((n) => n.id === other)!;
    assert.equal(changed.text, 'there, changed');
    assert.equal(changed.due, 9000);
    assert.equal(changed.o, undefined);
    assert.deepEqual(made, [other]);
    // Not changed here, so it does not go back.
    assert.deepEqual((await notesSince(mine, stampOf(kept), false)).notes, []);
    assert.deepEqual(written, [1]);
    // Deleted there: gone here, and a change from before does not bring it back.
    result = await mergeNotes(mine, [], [{ id: other, v: 30 }]);
    assert.deepEqual(result.gone, [other]);
    await mergeNotes(mine, [from(other, 'again', 25)], []);
    assert.deepEqual((await loadNotes(mine)).map((n) => n.id), [kept.id]);
    // A change here after all of them is stamped after them, whatever the clock.
    const v = stampOf(kept);
    await mergeNotes(mine, [from(newNoteId(), 'far ahead', v + 10_000_000)], []);
    const next = await changeNote(mine, kept.id, { due: 1 });
    assert.ok(stampOf(next!) > v + 10_000_000);
    assert.deepEqual(came.length, 4);
  } finally {
    stopWritten();
    stopCame();
  }
});

test("a note's photo that came waits on the relay until taken, then is kept as the note's", async () => {
  files.clear();
  blobs.clear();
  const mine = place();
  const id = newNoteId();
  const waiting = await keepFile(bytesSource(randomBytes(2000)), { name: 'a.jpg', mime: 'image/jpeg', kind: 'photo' });
  const from = { relay: 'wss://relay.example.org', ids: 'ab'.repeat(24 * waiting.count) };
  await mergeNotes(mine, [{ note: { id, at: 1, text: '', v: 5 }, make: async () => ({ file: { ...waiting, from } }) }], []);
  const taken = await keepFile(bytesSource(randomBytes(2000)), { name: 'a.jpg', mime: 'image/jpeg', kind: 'photo' });
  assert.equal(await setNoteFile(mine, id, 'cd'.repeat(24), taken), false);
  assert.equal(await setNoteFile(mine, id, from.ids, taken), true);
  assert.deepEqual((await loadNotes(mine))[0].file, taken);
});

// A note another app asks to add, with erevos://myself?note=…&due=… (lib/note-link.ts).
test('a note from a link: its words cleaned, its reminder only when it is to come', async () => {
  const { linkNote, linkNoteKey, MAX_LINK_NOTE } = await import('../lib/note-link');
  const now = Date.UTC(2026, 10, 6, 12);
  const hour = 60 * 60_000;
  assert.equal(linkNote({}, now), null);
  assert.equal(linkNote({ note: '   ' }, now), null);
  assert.equal(linkNote({ note: ['a', 'b'] }, now), null);
  assert.deepEqual(linkNote({ note: ' Fasouli: rent ‮450 €\u0007 ' }, now), { text: 'Fasouli: rent 450 €' });
  assert.deepEqual(linkNote({ note: 'a\r\n\n\n\nb' }, now), { text: 'a\n\nb' });
  assert.equal(linkNote({ note: 'x'.repeat(5000) }, now)!.text.length, MAX_LINK_NOTE);
  assert.deepEqual(linkNote({ note: 'pay', due: String(now + 24 * hour) }, now), { text: 'pay', due: now + 24 * hour });
  for (const due of [String(now - hour), String(now + 30_000), String(now + 400 * 24 * hour), 'soon', '1e15', '-5', '']) {
    assert.deepEqual(linkNote({ note: 'pay', due }, now), { text: 'pay' }, due);
  }
  assert.notEqual(linkNoteKey({ text: 'pay', due: 1 }), linkNoteKey({ text: 'pay' }));
});

test('a reminder that comes again moves to its next time once seen, and a link can ask for one', async () => {
  const { nextDue, everyOfText } = await import('../lib/note-repeat');
  const { linkNote, linkNoteKey } = await import('../lib/note-link');
  const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 9, 0).getTime();
  // Monthly from 31 January: the last day of a shorter month, then the 31st again.
  assert.equal(nextDue(at(2027, 1, 31), { u: 'm', n: 1 }, at(2027, 2, 1)), at(2027, 2, 28));
  assert.equal(nextDue(at(2027, 1, 31), { u: 'm', n: 1 }, at(2027, 2, 28)), at(2027, 3, 31));
  // Seen late: the first time after now, on the same clock time.
  assert.equal(nextDue(at(2027, 1, 15), { u: 'w', n: 2 }, at(2027, 2, 20)), at(2027, 2, 26));
  assert.equal(nextDue(at(2027, 1, 15), { u: 'y', n: 1 }, at(2027, 1, 16)), at(2028, 1, 15));
  assert.deepEqual(everyOfText('3m'), { u: 'm', n: 3 });
  for (const bad of ['0m', '1h', 'm', '1000d', 7]) assert.equal(everyOfText(bad), null);

  const now = Date.now();
  const due = now + 3_600_000;
  assert.deepEqual(linkNote({ note: 'rent', due: String(due), every: '1m' }, now), { text: 'rent', due, every: { u: 'm', n: 1 } });
  // Without a reminder, or with nonsense, it is a plain note or reminder.
  assert.deepEqual(linkNote({ note: 'rent', every: '1m' }, now), { text: 'rent' });
  assert.deepEqual(linkNote({ note: 'rent', due: String(due), every: 'often' }, now), { text: 'rent', due });
  assert.notEqual(linkNoteKey({ text: 'rent', due }), linkNoteKey({ text: 'rent', due, every: { u: 'm', n: 1 } }));

  files.clear();
  const mine = place();
  const past = Date.now() - 1000;
  const rent = await addNote(mine, note('rent', past - 1000, { due: past, every: { u: 'd', n: 1 } }));
  const once = await addNote(mine, note('once', past - 1000, { due: past }));
  const again = await markTold(mine, [rent.id, once.id]);
  assert.deepEqual(again.map((n) => n.id), [rent.id]);
  const [r, o] = await loadNotes(mine);
  assert.equal(r.due, nextDue(past, { u: 'd', n: 1 }, past));
  assert.ok(isWaiting(r) && !r.told);
  assert.ok(o.told);
  // Taking the reminder away takes the repeating away too.
  await changeNote(mine, rent.id, { due: null });
  assert.equal((await loadNotes(mine))[0].every, undefined);
});

test("a folder's name: one line, trimmed, its longest; the folders made here first, then those only notes name", () => {
  assert.equal(folderName('  Work\n  ideas \u202e '), 'Work ideas');
  assert.equal(folderName(42), '');
  assert.equal(folderName(' \t '), '');
  assert.equal([...folderName('Φ'.repeat(MAX_FOLDER_NAME + 5))].length, MAX_FOLDER_NAME);
  const notes = [note('a', 1, { folder: 'Zeta' }), note('b', 2, { folder: 'Alpha' }), note('c', 3), note('d', 4, { folder: 'Home' })];
  assert.deepEqual(foldersOf(notes, ['Home', 'Empty', 'Home']), ['Home', 'Empty', 'Alpha', 'Zeta']);
});

test('folders: made, a note put in one and taken out, renamed and deleted, the notes staying', async () => {
  files.clear();
  const mine = place();
  const written: number[] = [];
  const stop = onNotesWritten((p) => p === mine && written.push(1));
  try {
    assert.equal(await addFolder(mine, '  Shopping '), 'Shopping');
    assert.equal(await addFolder(mine, 'Shopping'), 'Shopping');
    assert.equal(await addFolder(mine, '   '), '');
    await addFolder(mine, 'Work');
    // An empty folder is this device's alone: nothing goes to the others.
    assert.deepEqual(written, []);
    assert.deepEqual(await loadFolders(mine), ['Shopping', 'Work']);
    const milk = await addNote(mine, note('milk', 1000, { folder: 'Shopping' }));
    const bread = await addNote(mine, note('bread', 2000));
    assert.equal(milk.folder, 'Shopping');
    const moved = await changeNote(mine, bread.id, { folder: ' Shopping ' });
    assert.equal(moved?.folder, 'Shopping');
    assert.ok(stampOf(moved!) > stampOf(milk));
    // Renamed: its notes go with it, each changed, for the other devices too, and it keeps its place.
    const before = stampOf(moved!);
    await changeFolder(mine, 'Shopping', 'Groceries');
    let notes = await loadNotes(mine);
    assert.deepEqual(notes.map((n) => n.folder), ['Groceries', 'Groceries']);
    assert.deepEqual(await loadFolders(mine), ['Groceries', 'Work']);
    assert.deepEqual((await notesSince(mine, before, false)).notes.map((n) => [n.text, n.folder]), [['milk', 'Groceries'], ['bread', 'Groceries']]);
    // Taken out of it, and the folder deleted: the notes stay, in none.
    await changeNote(mine, milk.id, { folder: null });
    await changeFolder(mine, 'Groceries', null);
    notes = await loadNotes(mine);
    assert.deepEqual(notes.map((n) => [n.text, n.folder]), [['milk', undefined], ['bread', undefined]]);
    assert.deepEqual(await loadFolders(mine), ['Work']);
    // Renamed onto another's name, the two are one.
    await addFolder(mine, 'Ideas');
    await changeFolder(mine, 'Ideas', 'Work');
    assert.deepEqual(await loadFolders(mine), ['Work']);
  } finally {
    stop();
  }
  // At their most, no more is made.
  const full = place();
  for (let i = 0; i < MAX_FOLDERS; i++) await addFolder(full, `F${i}`);
  await assert.rejects(addFolder(full, 'one more'));
});

test("folders from another device: a note's folder comes with it, and one renamed or deleted there goes here too", async () => {
  files.clear();
  const mine = place();
  await addFolder(mine, 'Trips');
  await addFolder(mine, 'Empty');
  const id = newNoteId();
  const from = (folder: string | undefined, v: number): NoteCame => ({ note: { id, at: 500, text: 'tickets', v, ...(folder !== undefined ? { folder } : {}) }, make: async () => ({}) });
  await mergeNotes(mine, [from('Trips', 10)], []);
  assert.equal((await loadNotes(mine))[0].folder, 'Trips');
  // Renamed there: the new name takes the old one's place here; an empty one made here stays.
  await mergeNotes(mine, [from('Travel', 20)], []);
  assert.equal((await loadNotes(mine))[0].folder, 'Travel');
  assert.deepEqual(await loadFolders(mine), ['Travel', 'Empty']);
  // Changed on a device from before folders, which says no folder at all: the note stays in its folder.
  await mergeNotes(mine, [from(undefined, 25)], []);
  assert.equal((await loadNotes(mine))[0].folder, 'Travel');
  assert.deepEqual(await loadFolders(mine), ['Travel', 'Empty']);
  // Deleted there ('' is no folder): the note stays, in none, and the folder goes.
  await mergeNotes(mine, [from('', 30)], []);
  assert.equal((await loadNotes(mine))[0].folder, undefined);
  assert.deepEqual(await loadFolders(mine), ['Empty']);
  // A folder that still holds notes here stays, whatever left it.
  const kept = [note('x', 1, { folder: 'A' })];
  assert.deepEqual(leftFolders(['A', 'B'], kept, new Map([['A', new Set([''])], ['B', new Set(['C', 'D'])]])), ['A']);
});

test("a note's folder goes to the account's other devices on the wire; a device from before leaves it out", () => {
  const id = newNoteId();
  const read = (folder: unknown) => {
    const bytes = encodeOne({ k: 'notes', list: [{ id, at: 1, v: 2, text: 'hi', folder } as never], gone: [] }, null)!;
    const said = new Parts().take('x', bytes);
    assert.equal(said?.k, 'notes');
    return said?.k === 'notes' ? said.list[0] : null;
  };
  assert.equal(read('Work')?.folder, 'Work');
  // '' says the note is in no folder; nothing said (a device from before folders) leaves it where it is.
  assert.equal(read('')?.folder, '');
  assert.equal('folder' in (read(undefined) ?? {}), false);
  assert.equal(read('x'.repeat(81))?.folder, undefined);
  assert.equal(read(7)?.folder, undefined);
  assert.equal(read(undefined)?.text, 'hi');
});
