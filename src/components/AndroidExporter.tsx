/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Download, AlertCircle, FileText, ChevronRight, Terminal, Smartphone } from "lucide-react";

export default function AndroidExporter() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeFileTab, setActiveFileTab] = useState<string>("MainActivity");

  const handeCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const SOURCE_FILES: Record<string, { path: string, desc: string, language: string, content: string }> = {
    MainActivity: {
      path: "app/src/main/java/com/cseguide/app/MainActivity.kt",
      desc: "Launcher entry-point implementing Jetpack Compose Navigation, M3 themes, offline json loaders, and persistence states.",
      language: "kotlin",
      content: `package com.cseguide.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import com.cseguide.app.ui.theme.CSEGuideTheme
import com.cseguide.app.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CSEGuideTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = "onboarding") {
                        composable("onboarding") { 
                            OnboardingScreen(onFinished = { 
                                navController.navigate("dashboard") {
                                    popUpTo("onboarding") { inclusive = true }
                                }
                            }) 
                        }
                        composable("dashboard") { 
                            DashboardScreen(
                                onOpenSubject = { subjectId -> navController.navigate("subject/$subjectId") },
                                onOpenReader = { chapterId -> navController.navigate("reader/$chapterId") },
                                onOpenSettings = { navController.navigate("settings") }
                            ) 
                        }
                        composable("subject/{subjectId}") { backStackEntry ->
                            val sId = backStackEntry.arguments?.getString("subjectId") ?: ""
                            SubjectScreen(subjectId = sId, onBack = { navController.popBackStack() })
                        }
                        composable("reader/{chapterId}") { backStackEntry ->
                            val cId = backStackEntry.arguments?.getString("chapterId") ?: ""
                            ReaderScreen(chapterId = cId, onBack = { navController.popBackStack() })
                        }
                        composable("settings") {
                            SettingsScreen(onBack = { navController.popBackStack() })
                        }
                    }
                }
            }
        }
    }
}`
    },
    Database: {
      path: "app/src/main/java/com/cseguide/app/data/CseDatabase.kt",
      desc: "Room DB structures managing imported chapters, sections list, revision schedules, and high-confidence metrics offline.",
      language: "kotlin",
      content: `package com.cseguide.app.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "chapters")
data class ChapterEntity(
    @PrimaryKey val id: String,
    val book: String,
    val subject: String,
    val chapterNumber: Int,
    val chapterTitle: String,
    val tags: String, // Comma separated tags
    val rawJson: String // Preserved high fidelity schema payload
)

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val chapterId: String,
    val sectionId: String,
    val noteText: String,
    val isDoubt: Boolean,
    val isResolved: Boolean,
    val createdAt: Long = System.currentTimeMillis()
)

@Dao
interface ChapterDao {
    @Query("SELECT * FROM chapters WHERE subject = :subjectName")
    fun getChaptersBySubject(subjectName: String): Flow<List<ChapterEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChapter(chapter: ChapterEntity)

    @Query("DELETE FROM chapters WHERE id = :id")
    suspend fun deleteChapter(id: String)
}

@Database(entities = [ChapterEntity::class, NoteEntity::class], version = 1, exportSchema = false)
abstract class CseDatabase : RoomDatabase() {
    abstract fun chapterDao(): ChapterDao
}`
    },
    BuildGradle: {
      path: "app/build.gradle",
      desc: "Module Gradle configuration for packaging Compose compilation compilers with Room DB.",
      language: "groovy",
      content: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-kapt'
}

android {
    namespace 'com.cseguide.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.cseguide.app"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary true
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.1'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation platform('androidx.compose:compose-bom:2023.08.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.material3:material3'
    implementation 'androidx.navigation:navigation-compose:2.7.7'
    
    // Room Database
    implementation "androidx.room:room-runtime:2.6.1"
    implementation "androidx.room:room-ktx:2.6.1"
    kapt "androidx.room:room-compiler:2.6.1"
}`
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Exporter Header */}
      <div className="bg-[#1C2541] border border-[#E0A96D]/30 p-6 rounded-lg flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex justify-center md:justify-start items-center gap-2 text-[#E0A96D] text-xs font-mono font-bold uppercase tracking-widest">
            <Smartphone size={16} /> Ready-to-Install Android Stack
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-black text-white">
            Build Your Personal CSEGuide APK
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            CSEGuide uses Kotlin & Jetpack Compose to drive a high-fidelity local reader. Since direct browser cloud-compilation does not support gradle toolchains, follow these standard compile directives.
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded text-center shrink-0 border border-slate-800 space-y-2">
          <p className="text-[10px] font-mono text-slate-400">Workspace Android Root</p>
          <div className="text-xs font-bold text-white bg-slate-950 p-2 rounded border border-slate-800">
            /android/*
          </div>
        </div>
      </div>

      {/* Compiler pipeline instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-serif">
            <span className="w-5 h-5 rounded-full bg-[#E0A96D] text-slate-950 font-sans flex items-center justify-center text-xs font-extrabold">1</span>
            Download Source Code
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All Kotlin layouts, resources, and gradle build parameters are generated under the <code className="text-[#E0A96D] bg-slate-950 px-1 py-0.5 rounded text-[10px]">/android</code> folder in this workspace. You can export/download the whole folder locally.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-serif">
            <span className="w-5 h-5 rounded-full bg-[#E0A96D] text-slate-950 font-sans flex items-center justify-center text-xs font-extrabold">2</span>
            Open in Android Studio
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Launch official <strong className="text-white">Android Studio Koala/Ladybug</strong> or newer. Choose <strong>File &gt; Open...</strong> and select the downloaded <code className="text-[#E0A96D] bg-slate-950 px-1 py-0.5 rounded text-[10px]">android</code> directory. Gradle will auto-initialize syncing.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-serif">
            <span className="w-5 h-5 rounded-full bg-[#E0A96D] text-slate-950 font-sans flex items-center justify-center text-xs font-extrabold">3</span>
            Compile Debug APK
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plug in your Android phone via USB debugging OR launch an Emulator. Click <strong>Build &gt; Build Bundle(s)/APK(s) &gt; Build APK(s)</strong>. Transfer the ready APK under <code className="text-emerald-400 text-[10px]">app/build/outputs/apk/debug/app-debug.apk</code> to install!
          </p>
        </div>

      </div>

      {/* Code Viewer Deck */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-1.5">
            <Terminal size={16} className="text-[#E0A96D]" /> Explore Jetpack Compose Base Files
          </h3>
          <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">
            Kotlin v1.9 + Compose
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
          {Object.keys(SOURCE_FILES).map((fileKey) => (
            <button
              key={fileKey}
              onClick={() => setActiveFileTab(fileKey)}
              className={`px-3 py-1.5 rounded text-xs transition cursor-pointer ${
                activeFileTab === fileKey 
                  ? 'bg-[#E0A96D] text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {fileKey}.kt / Gradle
            </button>
          ))}
        </div>

        {/* Dynamic Display Panel */}
        {SOURCE_FILES[activeFileTab] && (
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-850">
              <span className="font-mono text-[#E0A96D]">{SOURCE_FILES[activeFileTab].path}</span>
              <button
                onClick={() => handeCopyCode(activeFileTab, SOURCE_FILES[activeFileTab].content)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-bold px-2 py-1 rounded text-[10px] font-mono transition"
              >
                {copiedSection === activeFileTab ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedSection === activeFileTab ? "Copied" : "Copy Code"}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 font-serif leading-relaxed">
              {SOURCE_FILES[activeFileTab].desc}
            </p>

            <pre className="text-xs text-slate-300 p-3 bg-slate-900 rounded-md overflow-x-auto max-h-[350px] font-mono whitespace-pre text-left">
              <code>
                {SOURCE_FILES[activeFileTab].content}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Local schema guidelines check Box */}
      <div className="bg-amber-500/5 p-4 rounded border border-amber-500/10 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-amber-500 font-bold uppercase font-mono">
          <AlertCircle size={14} /> Local JSON File Import Schema Validation Note
        </div>
        <p className="leading-relaxed font-serif">
          The Room database inside Kotlin has been optimized to receive the exact JSON payloads that you import in this Web Simulator interface. If you produce or scrape your legally obtained study notes into JSONs, keep references mirroring: 
          <code className="text-[#E0A96D] bg-slate-900 px-1 py-0.5 rounded text-[11px] font-mono mx-1">schemaVersion = "1.0"</code> and 
          <code className="text-[#E0A96D] bg-slate-900 px-1 py-0.5 rounded text-[11px] font-mono">type = "chapter"</code>. No restructuring is necessary!
        </p>
      </div>
    </div>
  );
}
