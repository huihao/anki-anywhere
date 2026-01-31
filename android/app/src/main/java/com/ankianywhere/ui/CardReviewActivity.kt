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
        loadDueCards()
    }
    
    private fun setupQualityButtons() {
        for (i in 0..5) {
            val buttonId = resources.getIdentifier("quality$i", "id", packageName)
            findViewById<Button>(buttonId).setOnClickListener {
                reviewCard(i)
            }
        }
    }
    
    private fun loadDueCards() {
        apiService.getDueCards(deckId) { result ->
            runOnUiThread {
                result.fold(
                    onSuccess = { loadedCards ->
                        cards = loadedCards
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
                        cards = loadedCards
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
            questionTextView.text = card.front
            answerTextView.text = card.back
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
                    onSuccess = {
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
}
