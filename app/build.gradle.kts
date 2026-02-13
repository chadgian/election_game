plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.electiongame"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.electiongame"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "2.0"
        buildConfigField("boolean", "IS_NEW_ARCHITECTURE_ENABLED", "false")
        buildConfigField("boolean", "IS_HERMES_ENABLED", "true")
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("com.facebook.react:react-android:0.74.5")
    implementation("com.facebook.react:hermes-android:0.74.5")
}
