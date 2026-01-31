package com.ankianywhere.models

import com.google.gson.annotations.SerializedName
import java.util.Date

data class Deck(
    val id: Int,
    @SerializedName("user_id") val userId: Int,
    val name: String,
    val description: String?,
    @SerializedName("created_at") val createdAt: Date,
    @SerializedName("updated_at") val updatedAt: Date
)

data class Card(
    val id: Int,
    @SerializedName("deck_id") val deckId: Int,
    val front: String,
    val back: String,
    @SerializedName("source_url") val sourceUrl: String?,
    @SerializedName("next_review_date") val nextReviewDate: Date?,
    val interval: Int?,
    val repetitions: Int?,
    @SerializedName("created_at") val createdAt: Date,
    @SerializedName("updated_at") val updatedAt: Date
)

data class CardReview(
    val id: Int,
    @SerializedName("card_id") val cardId: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("ease_factor") val easeFactor: Double,
    val interval: Int,
    val repetitions: Int,
    @SerializedName("next_review_date") val nextReviewDate: Date,
    @SerializedName("last_review_date") val lastReviewDate: Date?
)

data class ReviewRequest(
    val cardId: Int,
    val quality: Int
)
