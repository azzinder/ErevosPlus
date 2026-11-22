// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { CollectionItem, CollectionPlace } from '../lock/collection-data';
import type { Cut, Turn } from './photo-cut';

// Turning and cutting a photo is on the phone only for now (collection-edit.ts).

export const CAN_EDIT = false;
export { editedName, wholeCut, type Cut, type Turn } from './photo-cut';

export const editPhoto = (_place: CollectionPlace, _item: CollectionItem, _turn: Turn, _cut: Cut): Promise<CollectionItem> => Promise.reject(new Error('Not in the web build.'));
