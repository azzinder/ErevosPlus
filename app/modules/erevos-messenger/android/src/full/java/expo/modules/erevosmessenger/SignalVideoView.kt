// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import android.content.Context
import android.view.View
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

/**
 * Where a Signal video call is drawn (components/signal-call.tsx): `side` "remote" is the other
 * phone's picture, "local" this phone's camera. The drawing view itself is RingRTC's, made in its
 * own room (SignalCalls), and only held here as a plain View.
 */
class SignalVideoView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private var side = ""
  private var shown: View? = null

  fun setSide(value: String) {
    if (value == side) return
    detach()
    side = value
    attach()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    shown?.layout(0, 0, r - l, b - t)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    attach()
  }

  override fun onDetachedFromWindow() {
    detach()
    super.onDetachedFromWindow()
  }

  private fun attach() {
    if (side.isEmpty() || !isAttachedToWindow || shown != null) return
    val v = SignalCalls.view(context, side) ?: return
    shown = v
    addView(v)
    v.layout(0, 0, width, height)
  }

  private fun detach() {
    val v = shown ?: return
    shown = null
    removeView(v)
    SignalCalls.forget(v)
  }
}
