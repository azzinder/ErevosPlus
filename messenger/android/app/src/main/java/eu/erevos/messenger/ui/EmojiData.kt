// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

/** A group of emoji in the picker. */
class EmojiCategory(val title: String, val icon: String, val emoji: List<String>)

/**
 * The emoji of the picker, as plain strings that Android 8 and newer can draw. Sequences that
 * need a joiner (families, professions) are left out so that none shows as two pictures.
 */
object EmojiData {
    private fun list(text: String): List<String> = text.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }

    private val SMILEYS = list(
        """
        😀 😁 😂 😃 😄 😅 😆 😇 😈 😉 😊 😋 😌 😍 😎 😏
        😐 😑 😒 😓 😔 😕 😖 😗 😘 😙 😚 😛 😜 😝 😞 😟
        😠 😡 😢 😣 😤 😥 😦 😧 😨 😩 😪 😫 😬 😭 😮 😯
        😰 😱 😲 😳 😴 😵 😶 😷 ☺️ 🙁 🙂 🙃 🙄 🤐 🤑 🤒
        🤓 🤔 🤕 🤗 🤠 🤡 🤢 🤣 🤤 🤥 🤦 🤧 🤨 🤩 🤪 🤫
        🤬 🤭 🤮 🤯 👿 👹 👺 💀 ☠️ 👻 👽 👾 🤖 💩 😺 😸
        😹 😻 😼 😽 🙀 😿 😾 🙈 🙉 🙊 💋 💌 💘 💝 💖 💗
        💓 💞 💕 💟 ❣️ 💔 ❤️ 🧡 💛 💚 💙 💜 🖤 💯 💢 💥
        💫 💦 💨 💣 💬 💭 💤 👋 🤚 🖐️ ✋ 🖖 👌 ✌️ 🤞 🤟
        🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌
        👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 👂 👃 🧠 👀 👁️ 👅 👄 👶
        👷 👸 👼 🎅 🤶 👦 👧 👨 👩 👴 👵 👮 🕵️ 💂 🤴
        👰 🤵 🤰 🙇 🤷 💁 🙅 🙆 🙋 🙎 🙍 💇 💆 💃 🕺 👯
        🚶 🏃 👫 👬 👭 👪 👥 👣 👑 👒 🎩 🎓 👓 🕶️ 👔 👕
        👖 👗 👘 👙 👚 👛 👜 👝 🎒 👞 👟 👠 👡 👢 💍 💄
        """,
    )

    private val ANIMALS = list(
        """
        🐵 🐶 🐷 🐸 🐹 🐺 🐻 🐼 🦀 🦁 🦂 🦃 🦄 🐽 🐾 🐿️
        🦅 🦆 🦇 🦈 🦉 🦊 🦋 🦌 🦍 🦎 🦏 🦐 🦑 🐀 🐁 🐂
        🐃 🐄 🐅 🐆 🐇 🐈 🐉 🐊 🐋 🐌 🐍 🐎 🐏 🐐 🐑 🐒
        🐓 🐔 🐕 🐖 🐗 🐘 🐙 🐚 🐛 🐜 🐝 🐞 🐟 🐠 🐡 🐢
        🐣 🐤 🐥 🐦 🐧 🐨 🐩 🐪 🐫 🐬 🐭 🐮 🐯 🐰 🐱 🐲
        🐳 🐴 🕊️ 🦕 🦖 🦗 💐 🌸 💮 🏵️ 🌹 🥀 🌺 🌻 🌼 🌷
        🌱 🌲 🌳 🌴 🌵 🌾 🌿 ☘️ 🍀 🍁 🍂 🍃 🍄 🌰 🌍 🌎
        🌏 🌐 🌑 🌓 🌔 🌕 🌛 🌜 🌞 🌝 🌚 🌟 🌠 🌀 🌈 ☀️
        ⛅️ ☁️ ⛈️ ❄️ ☃️ ⛄️ ☂️ ☔ ⚡ 🔥 💧 🌊 🎄 ✨️ 🎃
        """,
    )

    private val FOOD = list(
        """
        🍇 🍈 🍉 🍊 🍋 🍌 🍍 🍎 🍏 🍐 🍑 🍒 🍓 🥝 🍅 🥑
        🍆 🥔 🥕 🌽 🌶️ 🥒 🥜 🍞 🥐 🥖 🥞 🧀 🍖 🍗 🥓 🍔
        🍟 🍕 🌭 🌮 🌯 🥙 🥚 🍳 🥘 🍲 🥗 🍿 🍱 🍘 🍙 🍚
        🍛 🍜 🍝 🍠 🍢 🍣 🍤 🍥 🍡 🦐 🦑 🍦 🍧 🍨 🍩 🍪
        🎂 🍰 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🍵 🍶 🍾 🍷 🍸 🍹
        🍺 🍻 🥂 🥃 🥤 🥢 🍽️ 🍴 🥄
        """,
    )

    private val ACTIVITIES = list(
        """
        ⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🥅 🏒 🏑 🏏 ⛳ 🏹
        🎣 🥊 🥋 ⛸️ 🎿 🛷 🎯 🎳 🎮 🕹️ 🎰 🎲 ♟️ 🎭 🎨 🎼
        🎤 🎧 🎷 🎸 🎹 🎺 🎻 🥁 🎬 🎦 🎫 🎟️ 🏆 🏅 🥇 🥈
        🥉 🎖️ 🎗️ 🎪 🎠 🎡 🎢 🎉 🎊 🎈 🎀 🎁 🎋 🎍 🎎 🎏
        🎐 🎑 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏄 🏊 🚣 🚴 🚵 🤹 🧘
        """,
    )

    private val TRAVEL = list(
        """
        🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🚚 🚛 🚜 🛴 🚲 🛵
        🏍️ 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈
        🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🚀 🛰️ 🚁 🛶 ⛵️ 🚤 🛳️ ⛴️
        🚢 ⚓️ ⛽️ 🚧 🚦 🚥 🚏 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢
        🎠 ⛲️ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🗻 🏕️ ⛺️ 🏠 🏡 🏘️ 🏚️
        🏗️ 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛️ ⛪️ 🕌
        🕍 🕋 ⛩️ 🗾 🎑 🏞️ 🌅 🌄 🌠 🎇 🎆 🌇 🌆 🏙️ 🌃 🌌
        🌉 🌁 ⌚ ⏰ ⏳ ⌛
        """,
    )

    private val OBJECTS = list(
        """
        📱 📲 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💽 💾 💿 📀 📷 📸 📹 🎥 📞
        ☎️ 📟 📠 📺 📻 🎙️ ⏱️ 🔋 🔌 💡 🔦 🕯️ 💸 💵 💰 💳
        💎 ⚖️ 🔧 🔨 ⚒️ 🛠️ 🔩 ⚙️ ⛓️ 🔫 💣 🔪 🗡️ ⚔️ 🛡️ 🚬
        ⚰️ ⚱️ 🔮 🔭 🔬 🕳️ 💊 💉 🌡️ 🚽 🚰 🚿 🛁 🛀 🔑 🗝️
        🚪 🛋️ 🛏️ 🛌 🖼️ 🛍️ 🛒 🎁 🎈 🎏 🎀 🎊 🎉 🎎 🏮 🎐
        ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷️ 📪 📫 📬 📭 📮 📯 📜
        📃 📄 📑 📊 📈 📉 🗒️ 🗓️ 📆 📅 📇 🗃️ 🗳️ 🗄️ 📋 📁
        📂 🗂️ 🗞️ 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🔗 📎
        🖇️ 📐 📏 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏
        🔐 🔒 🔓
        """,
    )

    private val SYMBOLS = list(
        """
        💯 ❤️ 💛 💚 💙 💜 🖤 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝
        💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎️ ♈️ ♉️ ♊️
        ♋️ ♌️ ♍️ ♎️ ♏️ ♐️ ♑️ ♒️ ♓️ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳
        🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️
        🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💢 ♨️ 🚷 🚯 🚳
        🚱 🔞 📵 🚭 ❗️ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱
        ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾
        ♿️ 🅿️ 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 🚻 🚮 🎦 📶 🈁
        🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣
        5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ #️⃣ *️⃣ 🔟 🔢 ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️
        ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️
        ↔️ ↩️ ↪️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕️ ➖️ ➗️ ✖️
        ♾️ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔙 🔛 🔝 🔜 ✔️ ☑️
        🔘 ⚪ ⚫ 🔴 🔵 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾️
        ◽️ ◼️ ◻️ ⬛ ⬜ 🔈 🔇 🔉 🔊 🔔 🔕 📣 📢 💬 💭
        🗯️ ♠️ ♣️ ♥️ ♦️ 🃏 🎴 🀄 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗
        🕘 🕙 🕚 🕛
        """,
    )

    private val FLAGS = list(
        """
        🏁 🚩 🎌 🏴 🏳️ 🇬🇷 🇨🇾 🇬🇧 🇺🇸 🇪🇺 🇩🇪 🇫🇷 🇮🇹 🇪🇸 🇵🇹 🇳🇱
        🇧🇪 🇦🇹 🇨🇭 🇸🇪 🇳🇴 🇩🇰 🇫🇮 🇮🇪 🇵🇱 🇨🇿 🇸🇰 🇭🇺 🇷🇴 🇧🇬 🇭🇷 🇷🇸
        🇸🇮 🇦🇱 🇲🇰 🇧🇦 🇲🇪 🇹🇷 🇷🇺 🇺🇦 🇧🇾 🇱🇹 🇱🇻 🇪🇪 🇲🇩 🇬🇪 🇦🇲 🇦🇿
        🇮🇱 🇪🇬 🇸🇦 🇦🇪 🇶🇦 🇰🇼 🇮🇷 🇮🇶 🇮🇳 🇵🇰 🇧🇩 🇱🇰 🇨🇳 🇯🇵 🇰🇷 🇹🇼
        🇭🇰 🇹🇭 🇻🇳 🇮🇩 🇲🇾 🇸🇬 🇵🇭 🇦🇺 🇳🇿 🇨🇦 🇲🇽 🇧🇷 🇦🇷 🇨🇱 🇨🇴 🇵🇪
        🇻🇪 🇨🇺 🇿🇦 🇳🇬 🇰🇪 🇲🇦 🇩🇿 🇹🇳 🇪🇹
        """,
    )

    val categories: List<EmojiCategory> = listOf(
        EmojiCategory("Φατσούλες και άνθρωποι", "\uD83D\uDE00", SMILEYS),
        EmojiCategory("Ζώα και φύση", "\uD83D\uDC3B", ANIMALS),
        EmojiCategory("Φαγητό", "\uD83C\uDF54", FOOD),
        EmojiCategory("Δραστηριότητες", "\u26BD", ACTIVITIES),
        EmojiCategory("Ταξίδια", "\uD83D\uDE97", TRAVEL),
        EmojiCategory("Αντικείμενα", "\uD83D\uDCA1", OBJECTS),
        EmojiCategory("Σύμβολα", "\u2764\uFE0F", SYMBOLS),
        EmojiCategory("Σημαίες", "\uD83C\uDFC1", FLAGS),
    )
}
