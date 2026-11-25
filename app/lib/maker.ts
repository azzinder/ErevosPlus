// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { contactLinkName, parseContact, type ContactCode } from './contact-code';

// Contact (Settings → General, app/contact-maker.tsx): the maker's own Erevos contact link, as
// New chat → My link gives it, so whoever uses Erevos can write to its maker in Erevos
// itself, end-to-end encrypted, with no phone number or email (the maker's choice). It comes with
// the app, signed with the release. It names no one: the contact takes MAKER_NAME.
export const MAKER_LINK =
  'https://erevos-web.lphl.nekten.eu/c#id=a6bc617342667f637218537ccaa9601c8d4409b20871a1e6&relay=wss%3A%2F%2Ferevos.lphl.nekten.eu&key=AZ1b8Q-FxqdffrUSTJn5XPHS3Wv_BUJnRSCYp5a7Vxkrw5Yw7D7zX-SX9vCti0CxdLdHP3WH9i1gyfKz2nubL22Aby8ahgtk5vommSMOoHv-H2csNjVcrU5R7PVB89ZzM5-gMgDTHuRyN5cJWJgmUv51wMf6NZt0FWZoEhrIv9WLEnlznX3notxZzkuYYAPGxzdGBivTrX5XfjL2B9ZmvSfiKXdwR2eFPf8BCMGCBQdGZOV4FqrgEU05xkeSIhAWTD_8fNdFik7raz_2Q9mppZ3sQdmQeKgXEw6sCOlYtVYcU7gVAs5LmhMAWjrHEMISpUv4LZ-pzSXob2BgXEKEfgn6WQ9EEcAlQGF8ZAybat-qpp1BKSXXlIHlqPA3Z8pFvGO1W9ugryRUc8hoKrlqWe9lwYbZswUYfdSJRzwCd_fWeNZcSfM3hkQ7OG6zBu_nRKklEGD5CdrpoZaybQGRZj30r2fGNHAXxGh6RrSZh0qyqIOEtpWRfqObHuHLFAWzRVq0WeLDGVxRrn0jJskbeNP4QZEQF4VYdv88KcwBDzUXVtr1PF7Za9y7sbYZqd5VelEJiH8yR3OhQHNcW6RSr6EjmVZlHWHAjQX5cTVZknm2cZWRC3l4DU6yFQBrJJt1iyEXSpxGqCOmaJoTktxXJytTbUUJAY_XvWa4OEY1AZ1BlZlnCwvIiyaCGZGmlZjxcuhZsAX2bxtcu7B4hgFHOqHljMJil0PsloMLG7ZAXvQxi5NzSlDaGJGkkHqsEzuaDVrJMWimrqL3zPpiYhjVsS67r0rDzrOFXmFCqG5llpuVSAM1yY4KIDMoQPCRypFSMhKSmKAxbWGizxkmSFcYbX-1tXcRSw6hiLN3T0kRNeGLRQhQTXAnYke0tpYKP7sCg__DShXZLaVQbxWRU35Vn5-nXhjZuD1qbEnbbsJBZGnIcfQymTCkWaT3JFakzV0Lhpv7hsnxn7EEam0YAf14LIirzxlVHDKZL1R5iLXQD_EXscz6YQfMVmuiUkuVa94zCKgZJB2MAMkpCPdDBNsya9q1jcKzxf1oTtMZhA_0zKU5BZ4ZbHIaqrC8YsNCs4dCzgipj2J6TY7VHftMrrIoNqc6lXrjVNo5ThH0J_3qIxaBAGOoDWESc06VD37gJEtioB_lXxMlTYX7C_uxDj6hzlGrPyyVqUKsJtLUqrNHcO1oX6yMw5jDS-MAMR9JH2qmgpZmOIgipG6Yz1ggD5IwTWN4f5WZATo4MCNSdOxaONGrYW4DD4_xOiFoX7F4gfZHR3KQo5_JNyKVO_SgYPcJOpiWKA7YeATDQQdCvV21xkCFac4Kn94JOf9yDdxIC7dwULRnF76jjLcmouUIyay5kopHk6mRFHZlskNhFnWgs093dVDkPdVKfJQkFJ51xcAHICIaq2g2Kxv7jiE3U0ByxJ4VNmysLPY1eJ1FWMCYAxRby5CVufr4h-3kUIGTnKx1be4rlmaXjO4Stvdxv_kmSRECZHd4d4JLdJHyS-egP6rlncKGs3UxJIlWSnYxt2H0AV1ht3xydq3EyYIlB0uJSyW2koKcKG9QmYI2ooeAbcgqJYbqGevqY8RQFlLAxi10ZMkwKBmzeo42EgyJDY8ztvThX4v3EyLiHbUIFv8ET9rhGreVHUIHiawDgVbDMrFhdLS9yk-OoCW2yF5WiMvA-BE-Fi8uxSgTkSJfrk50BJrqAHabL76Q5LNeUb40NBzRFZ7JMbSyyXMnwaYxSoZVBkCXk1XHa3f7W8MpBxGzCczhkC51I-NsuFyd7J4ulRwDxwY&rk=VQWqa_KAUscu-KDZd78f6w1d097BVqiXo1NdCByNFxo&nk=21eaea27e80135c4195269b7b1f5c39bafda9461d3068909bbcaa89a3d9c5501&nr=wss%3A%2F%2Frelay.damus.io,wss%3A%2F%2Fnos.lol,wss%3A%2F%2Frelay.primal.net';

/** The name the maker's contact takes when the link names none. */
export const MAKER_NAME = 'azzinder';

/** The maker's contact, with the name it is added under, or null while there is no link that reads. */
export function makerContact(link = MAKER_LINK): { code: ContactCode; name: string } | null {
  const code = link ? parseContact(link) : null;
  return code?.key ? { code, name: contactLinkName(link) || MAKER_NAME } : null;
}
