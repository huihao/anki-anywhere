package com.ankianywhere.ui

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.ankianywhere.R
import com.ankianywhere.models.Card
import com.ankianywhere.services.APIService

class CardReviewActivity : AppCompatActivity() {
    private lateinit var apiService: APIService
    private lateinit var questionTextView: TextView
    private lateinit var answerTextView: TextView
    private lateinit var showAnswerButton: Button
    private lateinit var qualityButtonsLayout: View
    
    private var cards = listOf<Card>()
    private var currentIndex = 0
    private var showingAnswer = false
    private var deckId: Int = 0
    private var newCardsLimit: Int = 20
    private var reviewCardsLimit: Int = 100
    private val reviewOptions = listOf(
        ReviewOption(0, "Again", 1),
        ReviewOption(1, "Hard", 3),
        ReviewOption(2, "Good", 4),
        ReviewOption(3, "Easy", 5)
    )
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_card_review)
        
        apiService = APIService(this)
        
        deckId = intent.getIntExtra("DECK_ID", 0)
        val deckName = intent.getStringExtra("DECK_NAME") ?: ""
        
        title = deckName
        
        questionTextView = findViewById(R.id.questionText)
        answerTextView = findViewById(R.id.answerText)
        showAnswerButton = findViewById(R.id.showAnswerButton)
        qualityButtonsLayout = findViewById(R.id.qualityButtonsLayout)
        
        showAnswerButton.setOnClickListener {
            showAnswer()
        }
        
        findViewById<Button>(R.id.randomButton).setOnClickListener {
            loadRandomCards()
        }
        
        setupQualityButtons()
        loadSessionLimits()
        loadDueCards()
    }
    
    private fun setupQualityButtons() {
        reviewOptions.forEach { option ->
            val buttonId = resources.getIdentifier("quality${option.buttonIndex}", "id", packageName)
            val button: Button? = findViewById(buttonId)
            button?.apply {
                text = option.label
                setOnClickListener {
                    reviewCard(option.quality)
                }
            }
        }

        for (i in 4..5) {
            val buttonId = resources.getIdentifier("quality$i", "id", packageName)
            val button: Button? = findViewById(buttonId)
            button?.visibility = View.GONE
        }
    }
    
    private fun loadDueCards() {
        apiService.getDueCards(deckId) { result ->
            runOnUiThread {
                result.fold(
                    onSuccess = { loadedCards ->
                        cards = applyReviewLimits(loadedCards)
                        currentIndex = 0
                        showingAnswer = false
                        displayCard()
                    },
                    onFailure = { error ->
                        Toast.makeText(this, "加载失败: ${error.message}", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
    
    private fun loadRandomCards() {
        apiService.getRandomCards(deckId, 10) { result ->
            runOnUiThread {
                result.fold(
                    onSuccess = { loadedCards ->
                        cards = applyNewLimits(loadedCards)
                        currentIndex = 0
                        showingAnswer = false
                        displayCard()
                    },
                    onFailure = { error ->
                        Toast.makeText(this, "加载失败: ${error.message}", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
    
    private fun displayCard() {
        if (currentIndex < cards.size) {
            val card = cards[currentIndex]
            questionTextView.text = cardQuestionText(card)
            answerTextView.text = cardAnswerText(card)
            answerTextView.visibility = View.GONE
            showAnswerButton.visibility = View.VISIBLE
            qualityButtonsLayout.visibility = View.GONE
            
            findViewById<TextView>(R.id.cardCounter).text = "${currentIndex + 1} / ${cards.size}"
        } else {
            questionTextView.text = "没有更多卡片"
            answerTextView.visibility = View.GONE
            showAnswerButton.visibility = View.GONE
            qualityButtonsLayout.visibility = View.GONE
        }
    }
    
    private fun showAnswer() {
        answerTextView.visibility = View.VISIBLE
        showAnswerButton.visibility = View.GONE
        qualityButtonsLayout.visibility = View.VISIBLE
        showingAnswer = true
    }
    
    private fun reviewCard(quality: Int) {
        val card = cards[currentIndex]
        
        apiService.reviewCard(card.id, quality) { result ->
            runOnUiThread {
                result.fold(
                    onSuccess = { review ->
                        showIntervalToast(quality, review.interval)
                        nextCard()
                    },
                    onFailure = { error ->
                        Toast.makeText(this, "评价失败: ${error.message}", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
    
    private fun nextCard() {
        currentIndex++
        showingAnswer = false
        displayCard()
    }

    private fun showIntervalToast(quality: Int, interval: Int) {
        val hint = if (quality >= 3) {
            "下次复习: ${interval}天后"
        } else {
            "进入短期复习 (10-60分钟内)"
        }
        Toast.makeText(this, hint, Toast.LENGTH_SHORT).show()
    }

    private fun cardQuestionText(card: Card): String {
        return renderCloze(card.front, false)
    }

    private fun cardAnswerText(card: Card): String {
        val base = if (card.back.isNotBlank()) card.back else card.front
        return renderCloze(base, true)
    }

    private fun renderCloze(text: String, reveal: Boolean): String {
        val regex = Regex("\\{\\{c\\d+::(.*?)(::(.*?))?}}", setOf(RegexOption.DOT_MATCHES_ALL))
        return regex.replace(text) { match ->
            val answer = match.groups[1]?.value.orEmpty()
            val hint = match.groups[3]?.value
            if (reveal) {
                answer
            } else if (!hint.isNullOrBlank()) {
                "[$hint]"
            } else {
                "..."
            }
        }
    }

    private fun applyNewLimits(loadedCards: List<Card>): List<Card> {
        return loadedCards.take(newCardsLimit)
    }

    private fun applyReviewLimits(loadedCards: List<Card>): List<Card> {
        val (reviewCards, newCards) = loadedCards.partition { card ->
            (card.repetitions ?: 0) > 0
        }
        val limitedReviewCards = reviewCards.take(reviewCardsLimit)
        val limitedNewCards = newCards.take(newCardsLimit)
        return limitedReviewCards + limitedNewCards
    }

    private fun loadSessionLimits() {
        val prefs = getSharedPreferences("anki_anywhere", MODE_PRIVATE)
        newCardsLimit = prefs.getInt("newCardsLimit", 20)
        reviewCardsLimit = prefs.getInt("reviewCardsLimit", 100)
    }
}

private data class ReviewOption(
    val buttonIndex: Int,
    val label: String,
    val quality: Int
)
