// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Session's own library (libsession-util-android), only from its makers' repository.
        maven {
            url = uri("https://oxen.rocks/session-foundation/libsession-util-android/maven")
            content { includeGroup("org.sessionfoundation") }
        }
    }
}
rootProject.name = "erevos-messenger"
include(":app")
