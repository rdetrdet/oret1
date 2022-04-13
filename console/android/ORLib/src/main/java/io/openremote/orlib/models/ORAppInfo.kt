package io.openremote.orlib.models

data class ORAppInfo(
    val consoleAppIncompatible: Boolean,
    val realms: List<String>,
    val providers: List<String>,
    val description: String
)
