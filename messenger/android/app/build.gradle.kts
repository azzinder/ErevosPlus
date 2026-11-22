// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "eu.erevos.messenger"
    compileSdk = 36

    defaultConfig {
        applicationId = "eu.erevos.messenger.test"
        minSdk = 26
        targetSdk = 35
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "0.0.1-phase0"
        ndk { abiFilters += "arm64-v8a" }
    }

    buildTypes {
        getByName("debug") {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
        // Session's library is built with a newer Kotlin; its classes read fine with this one.
        freeCompilerArgs += listOf("-Xskip-metadata-version-check")
    }
    buildFeatures { compose = true }
}

dependencies {
    // The Go engine, built by `gomobile bind` into libs/core.aar (see .github/workflows/android.yml).
    implementation(files("libs/core.aar"))

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.material3)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.webkit)
    implementation(libs.zxing.core)
    implementation(libs.libsession.util.android)
    implementation(libs.webrtc)
}
