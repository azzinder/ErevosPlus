// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! The JNI side: `eu.erevos.messenger.signal.SignalCore` in the app.
//!
//! ```kotlin
//! object SignalCore {
//!     external fun init(dir: String, listener: SignalListener)
//!     external fun call(op: String, args: String): String
//! }
//! ```

use std::path::PathBuf;
use std::sync::{Arc, OnceLock};

use jni::objects::{GlobalRef, JClass, JObject, JString, JValue};
use jni::sys::jstring;
use jni::{JNIEnv, JavaVM};

use crate::engine::Engine;
use crate::Listener;

static ENGINE: OnceLock<Engine> = OnceLock::new();

struct JavaListener {
    vm: JavaVM,
    target: GlobalRef,
}

impl Listener for JavaListener {
    fn on_event(&self, json: String) {
        let Ok(mut env) = self.vm.attach_current_thread_permanently() else { return };
        let Ok(text) = env.new_string(json) else { return };
        let sent = env.call_method(&self.target, "onEvent", "(Ljava/lang/String;)V", &[JValue::Object(&text)]);
        if sent.is_err() || env.exception_check().unwrap_or(false) {
            let _ = env.exception_clear();
        }
        let _ = env.delete_local_ref(text);
    }
}

fn text(env: &mut JNIEnv, s: &JString) -> String {
    env.get_string(s).map(|s| s.into()).unwrap_or_default()
}

/// Starts the engine once; later calls keep the first one.
#[no_mangle]
pub extern "system" fn Java_eu_erevos_messenger_signal_SignalCore_init(
    mut env: JNIEnv,
    _class: JClass,
    dir: JString,
    listener: JObject,
) {
    if ENGINE.get().is_some() {
        return;
    }
    let dir = PathBuf::from(text(&mut env, &dir));
    let (Ok(vm), Ok(target)) = (env.get_java_vm(), env.new_global_ref(listener)) else { return };
    let _ = ENGINE.set(Engine::new(dir, Arc::new(JavaListener { vm, target })));
}

/// One call to the engine; blocks until it answers, so the app calls it off the main thread.
#[no_mangle]
pub extern "system" fn Java_eu_erevos_messenger_signal_SignalCore_call(
    mut env: JNIEnv,
    _class: JClass,
    op: JString,
    args: JString,
) -> jstring {
    let op = text(&mut env, &op);
    let args = text(&mut env, &args);
    let answer = match ENGINE.get() {
        Some(engine) => engine.call(&op, &args),
        None => r#"{"error":"signal engine not started"}"#.to_string(),
    };
    env.new_string(answer).map(|s| s.into_raw()).unwrap_or(std::ptr::null_mut())
}
