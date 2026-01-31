package com.ankianywhere.services

import android.content.Context
import android.content.SharedPreferences
import com.ankianywhere.models.*
import com.google.gson.GsonBuilder
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.Date

class APIService(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("anki_anywhere", Context.MODE_PRIVATE)
    private val client = OkHttpClient()
    private val gson = GsonBuilder()
        .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        .create()
    
    private var baseURL: String
        get() = prefs.getString("apiBaseURL", "http://localhost:3000/api") ?: "http://localhost:3000/api"
        set(value) = prefs.edit().putString("apiBaseURL", value).apply()
    
    private var authToken: String?
        get() = prefs.getString("authToken", null)
        set(value) = prefs.edit().putString("authToken", value).apply()
    
    fun setAuthToken(token: String) {
        authToken = token
    }
    
    fun setBaseURL(url: String) {
        baseURL = url
    }
    
    private fun buildRequest(endpoint: String, method: String = "GET", body: RequestBody? = null): Request {
        val url = "$baseURL$endpoint"
        val builder = Request.Builder().url(url)
        
        authToken?.let {
            builder.addHeader("Authorization", "Bearer $it")
        }
        
        builder.addHeader("Content-Type", "application/json")
        
        when (method) {
            "POST" -> builder.post(body ?: "".toRequestBody())
            "PUT" -> builder.put(body ?: "".toRequestBody())
            "DELETE" -> builder.delete()
            else -> builder.get()
        }
        
        return builder.build()
    }
    
    // Deck APIs
    fun getDecks(callback: (Result<List<Deck>>) -> Unit) {
        val request = buildRequest("/decks")
        
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(Result.failure(e))
            }
            
            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { responseBody ->
                    try {
                        val decks = gson.fromJson(responseBody, Array<Deck>::class.java).toList()
                        callback(Result.success(decks))
                    } catch (e: Exception) {
                        callback(Result.failure(e))
                    }
                } ?: callback(Result.failure(Exception("Empty response")))
            }
        })
    }
    
    // Card APIs
    fun getCards(deckId: Int, callback: (Result<List<Card>>) -> Unit) {
        val request = buildRequest("/cards/deck/$deckId")
        
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(Result.failure(e))
            }
            
            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { responseBody ->
                    try {
                        val cards = gson.fromJson(responseBody, Array<Card>::class.java).toList()
                        callback(Result.success(cards))
                    } catch (e: Exception) {
                        callback(Result.failure(e))
                    }
                } ?: callback(Result.failure(Exception("Empty response")))
            }
        })
    }
    
    fun getRandomCards(deckId: Int, limit: Int = 10, callback: (Result<List<Card>>) -> Unit) {
        val request = buildRequest("/cards/deck/$deckId/random?limit=$limit")
        
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(Result.failure(e))
            }
            
            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { responseBody ->
                    try {
                        val cards = gson.fromJson(responseBody, Array<Card>::class.java).toList()
                        callback(Result.success(cards))
                    } catch (e: Exception) {
                        callback(Result.failure(e))
                    }
                } ?: callback(Result.failure(Exception("Empty response")))
            }
        })
    }
    
    // Review APIs
    fun reviewCard(cardId: Int, quality: Int, callback: (Result<CardReview>) -> Unit) {
        val json = JSONObject()
        json.put("cardId", cardId)
        json.put("quality", quality)
        
        val body = json.toString().toRequestBody("application/json".toMediaType())
        val request = buildRequest("/reviews/review", "POST", body)
        
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(Result.failure(e))
            }
            
            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { responseBody ->
                    try {
                        val review = gson.fromJson(responseBody, CardReview::class.java)
                        callback(Result.success(review))
                    } catch (e: Exception) {
                        callback(Result.failure(e))
                    }
                } ?: callback(Result.failure(Exception("Empty response")))
            }
        })
    }
    
    fun getDueCards(deckId: Int? = null, callback: (Result<List<Card>>) -> Unit) {
        val endpoint = if (deckId != null) "/reviews/due?deckId=$deckId" else "/reviews/due"
        val request = buildRequest(endpoint)
        
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(Result.failure(e))
            }
            
            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { responseBody ->
                    try {
                        val cards = gson.fromJson(responseBody, Array<Card>::class.java).toList()
                        callback(Result.success(cards))
                    } catch (e: Exception) {
                        callback(Result.failure(e))
                    }
                } ?: callback(Result.failure(Exception("Empty response")))
            }
        })
    }
}
