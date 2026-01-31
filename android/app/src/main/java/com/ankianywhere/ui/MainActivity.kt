package com.ankianywhere.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.ankianywhere.R
import com.ankianywhere.models.Deck
import com.ankianywhere.services.APIService
import com.google.android.material.floatingactionbutton.FloatingActionButton

class MainActivity : AppCompatActivity() {
    private lateinit var apiService: APIService
    private lateinit var recyclerView: RecyclerView
    private lateinit var deckAdapter: DeckAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        apiService = APIService(this)
        
        recyclerView = findViewById(R.id.deckRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        
        deckAdapter = DeckAdapter { deck ->
            val intent = Intent(this, CardReviewActivity::class.java)
            intent.putExtra("DECK_ID", deck.id)
            intent.putExtra("DECK_NAME", deck.name)
            startActivity(intent)
        }
        
        recyclerView.adapter = deckAdapter
        
        findViewById<FloatingActionButton>(R.id.settingsFab).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
        
        loadDecks()
    }
    
    override fun onResume() {
        super.onResume()
        loadDecks()
    }
    
    private fun loadDecks() {
        apiService.getDecks { result ->
            runOnUiThread {
                result.fold(
                    onSuccess = { decks ->
                        deckAdapter.submitList(decks)
                    },
                    onFailure = { error ->
                        Toast.makeText(this, "加载失败: ${error.message}", Toast.LENGTH_SHORT).show()
                    }
                )
            }
        }
    }
}

class DeckAdapter(
    private val onDeckClick: (Deck) -> Unit
) : RecyclerView.Adapter<DeckViewHolder>() {
    
    private var decks = listOf<Deck>()
    
    fun submitList(newDecks: List<Deck>) {
        decks = newDecks
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): DeckViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_deck, parent, false)
        return DeckViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: DeckViewHolder, position: Int) {
        holder.bind(decks[position], onDeckClick)
    }
    
    override fun getItemCount() = decks.size
}

class DeckViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
    private val nameTextView: android.widget.TextView = itemView.findViewById(R.id.deckName)
    private val descriptionTextView: android.widget.TextView = itemView.findViewById(R.id.deckDescription)
    
    fun bind(deck: Deck, onClick: (Deck) -> Unit) {
        nameTextView.text = deck.name
        descriptionTextView.text = deck.description ?: ""
        itemView.setOnClickListener { onClick(deck) }
    }
}
