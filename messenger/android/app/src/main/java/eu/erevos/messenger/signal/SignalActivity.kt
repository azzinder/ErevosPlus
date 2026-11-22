// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.signal

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import eu.erevos.messenger.ui.theme.MessengerTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Adds Signal: a new account with a phone number (SMS or call, after Signal's captcha), or
 * this phone linked to the Signal of another phone with a QR code.
 */
class SignalActivity : ComponentActivity() {
    companion object {
        fun open(context: Context) {
            context.startActivity(Intent(context, SignalActivity::class.java))
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { MessengerTheme { SignalSetup(onDone = { finish() }) } }
    }
}

private enum class Step { Choose, Phone, Captcha, Code, Name, Link, Done }

private const val CAPTCHA_PAGE = "https://signalcaptchas.org/registration/generate.html"

@Composable
private fun SignalSetup(onDone: () -> Unit) {
    val scope = rememberCoroutineScope()
    var step by remember { mutableStateOf(Step.Choose) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var phone by remember { mutableStateOf("+30") }
    var voice by remember { mutableStateOf(false) }
    var code by remember { mutableStateOf("") }
    var given by remember { mutableStateOf("") }
    var family by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        val ready = withContext(Dispatchers.IO) { Signal.open() }
        if (ready) step = Step.Done
    }

    fun run(work: suspend () -> JSONObject, next: (JSONObject) -> Unit) {
        busy = true
        error = null
        scope.launch {
            val r = withContext(Dispatchers.IO) { work() }
            busy = false
            if (r.has("error")) error = signalError(r.optString("error")) else next(r)
        }
    }

    fun register(captcha: String) = run({
        Signal.call("register", JSONObject().put("phone", phone.replace(" ", "")).put("voice", voice).put("captcha", captcha))
    }) { step = Step.Code }

    Column(
        Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).safeDrawingPadding()
            .padding(20.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Signal", style = MaterialTheme.typography.headlineMedium)
        if (!Signal.available) {
            Text("Η βιβλιοθήκη του Signal δεν φορτώθηκε σε αυτό το κινητό.", color = MaterialTheme.colorScheme.error)
            TextButton(onClick = onDone) { Text("Κλείσιμο") }
            return@Column
        }
        when (step) {
            Step.Choose -> {
                Text("Πώς να μπει το Signal;")
                Button(onClick = { step = Step.Phone }, modifier = Modifier.fillMaxWidth()) { Text("Με τον αριθμό μου (κύριος λογαριασμός)") }
                Text(
                    "Προσοχή: ο αριθμός που γράφεις εδώ αποσυνδέει το επίσημο Signal από όποιο κινητό τον έχει.",
                    style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error,
                )
                OutlinedButton(onClick = {
                    Signal.linkUrl = null
                    Signal.linkError = null
                    step = Step.Link
                    run({ Signal.call("link", JSONObject().put("name", "Erevos")) }) { }
                }, modifier = Modifier.fillMaxWidth()) { Text("Σύνδεση με το Signal άλλου κινητού (QR)") }
                TextButton(onClick = onDone) { Text("Άκυρο") }
            }
            Step.Phone -> {
                OutlinedTextField(
                    phone, { phone = it }, label = { Text("Αριθμός με τον κωδικό χώρας") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), modifier = Modifier.fillMaxWidth(),
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    androidx.compose.material3.Checkbox(voice, { voice = it })
                    Text("Κωδικός με κλήση αντί για SMS")
                }
                Text("Το Signal ζητά πρώτα να λύσεις ένα captcha στη σελίδα του.", style = MaterialTheme.typography.bodySmall)
                Button(enabled = phone.length >= 8 && !busy, onClick = { step = Step.Captcha }) { Text("Συνέχεια") }
            }
            Step.Captcha -> {
                Text("Λύσε το captcha. Μόλις τελειώσει, συνεχίζουμε μόνα μας.", style = MaterialTheme.typography.bodySmall)
                CaptchaView(Modifier.fillMaxWidth().size(width = 0.dp, height = 520.dp)) { token ->
                    step = Step.Phone
                    register(token)
                }
                TextButton(onClick = { step = Step.Phone }) { Text("Πίσω") }
            }
            Step.Code -> {
                Text("Γράψε τον κωδικό που ήρθε στο $phone.")
                OutlinedTextField(
                    code, { code = it.filter { c -> c.isDigit() }.take(6) }, label = { Text("Κωδικός") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword), modifier = Modifier.fillMaxWidth(),
                )
                Button(enabled = code.length == 6 && !busy, onClick = {
                    run({ Signal.call("confirm", JSONObject().put("code", code)) }) { step = Step.Name }
                }) { Text("Επιβεβαίωση") }
            }
            Step.Name -> {
                Text("Το όνομα που θα βλέπουν οι άλλοι στο Signal.")
                OutlinedTextField(given, { given = it.take(26) }, label = { Text("Όνομα") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(family, { family = it.take(26) }, label = { Text("Επώνυμο (προαιρετικό)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Button(enabled = given.isNotBlank() && !busy, onClick = {
                    run({ Signal.call("setProfile", JSONObject().put("given", given).put("family", family)) }) {
                        Signal.ready = true
                        step = Step.Done
                    }
                }) { Text("Αποθήκευση") }
            }
            Step.Link -> {
                val url = Signal.linkUrl
                if (Signal.ready) {
                    step = Step.Done
                } else if (Signal.linkError != null) {
                    Text("Η σύνδεση απέτυχε. " + signalError(Signal.linkError.orEmpty()), color = MaterialTheme.colorScheme.error)
                    TextButton(onClick = { step = Step.Choose }) { Text("Πίσω") }
                } else if (url == null) {
                    CircularProgressIndicator()
                } else {
                    Text("Στο άλλο κινητό: Signal → Ρυθμίσεις → Συνδεδεμένες συσκευές → «+», και σάρωσε:")
                    QrCode(url)
                    Text("Θα φαίνονται τα νέα μηνύματα από τη σύνδεση και μετά.", style = MaterialTheme.typography.bodySmall)
                }
            }
            Step.Done -> {
                Text("Το Signal μπήκε. Οι συνομιλίες του φαίνονται στην ίδια λίστα, με το σήμα «Signal».")
                Button(onClick = {
                    scope.launch {
                        withContext(Dispatchers.IO) { Signal.start() }
                        onDone()
                    }
                }) { Text("Εντάξει") }
            }
        }
        if (busy) CircularProgressIndicator()
        error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
    }
}

/** Signal's own captcha page; its answer comes back as a signalcaptcha:// link. */
@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun CaptchaView(modifier: Modifier, onToken: (String) -> Unit) {
    AndroidView(modifier = modifier, factory = { context ->
        WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val url = request.url.toString()
                    if (url.startsWith("signalcaptcha://")) {
                        onToken(url)
                        return true
                    }
                    return false
                }
            }
            loadUrl(CAPTCHA_PAGE)
        }
    })
}

@Composable
private fun QrCode(text: String) {
    val bitmap = remember(text) {
        val matrix = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, 720, 720)
        val bmp = Bitmap.createBitmap(matrix.width, matrix.height, Bitmap.Config.RGB_565)
        for (x in 0 until matrix.width) for (y in 0 until matrix.height) {
            bmp.setPixel(x, y, if (matrix[x, y]) android.graphics.Color.BLACK else android.graphics.Color.WHITE)
        }
        bmp.asImageBitmap()
    }
    Image(bitmap, "QR", Modifier.size(280.dp).background(Color.White).padding(8.dp))
}

private fun signalError(e: String): String = when {
    e == "captcha required" || e.contains("captcha", true) -> "Το Signal ζητά captcha. Δοκίμασε ξανά."
    e == "invalid phone number" || e.contains("phone number", true) -> "Ο αριθμός δεν είναι σωστός. Γράψε τον με τον κωδικό χώρας, π.χ. +30…"
    e.contains("423") || e.contains("lock", true) ->
        "Ο αριθμός έχει κλείδωμα εγγραφής (PIN του Signal). Εδώ δεν μπορεί να μπει με PIN ακόμα. " +
            "Κλείσε το στο επίσημο Signal (Ρυθμίσεις → Λογαριασμός → Κλείδωμα εγγραφής) και ξαναδοκίμασε, " +
            "ή διάλεξε «Σύνδεση με το Signal άλλου κινητού (QR)»."
    e.contains("rate", true) || e.contains("429") -> "Πολλές προσπάθειες. Περίμενε λίγο και ξαναδοκίμασε."
    e.contains("verif", true) || e.contains("invalid code", true) -> "Ο κωδικός δεν ήταν σωστός."
    e.contains("websocket", true) || e.contains("reqwest", true) || e.contains("connect", true) || e.contains("timed out", true) ->
        "Δεν υπάρχει σύνδεση με τους servers του Signal. Έλεγξε το ίντερνετ και ξαναδοκίμασε."
    e.contains("Keystore") -> e
    else -> "Κάτι πήγε στραβά στο Signal: $e"
}
