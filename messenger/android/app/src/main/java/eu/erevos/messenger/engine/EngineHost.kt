// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.engine

import kotlin.reflect.KProperty

/** A value of an engine that screens may follow (signed in, connection status …). */
interface Cell<T> {
    var value: T
}

/** Makes [Cell]s: plain ones by default; an app with Compose screens gives Compose state. */
interface CellMaker {
    fun <T> make(initial: T): Cell<T>
}

private class PlainCell<T>(initial: T) : Cell<T> {
    @Volatile override var value: T = initial
}

/**
 * What the engines need from the app that hosts them, without any screen code: whether the app
 * is in front, and how to make the values its screens follow. Set both before the engines start.
 */
object EngineHost {
    /** Whether the app is in front now (Session then reads new messages more often). */
    @Volatile var appInFront: () -> Boolean = { false }

    @Volatile var cells: CellMaker = object : CellMaker {
        override fun <T> make(initial: T): Cell<T> = PlainCell(initial)
    }
}

fun <T> cell(initial: T): Cell<T> = EngineHost.cells.make(initial)

operator fun <T> Cell<T>.getValue(thisRef: Any?, property: KProperty<*>): T = value

operator fun <T> Cell<T>.setValue(thisRef: Any?, property: KProperty<*>, v: T) {
    value = v
}
