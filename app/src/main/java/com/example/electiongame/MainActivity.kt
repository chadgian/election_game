package com.example.electiongame

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.electiongame.engine.GameEngine
import com.example.electiongame.model.GameState
import com.example.electiongame.model.WeeklyEvent

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                ElectionGameScreen()
            }
        }
    }
}

@Composable
private fun ElectionGameScreen() {
    var state by remember { mutableStateOf(GameEngine.newGame()) }
    var event by remember { mutableStateOf(GameEngine.generateWeeklyEvent(state)) }

    Scaffold(modifier = Modifier.fillMaxSize()) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Header(state)

            if (GameEngine.isFinished(state)) {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Election complete", style = MaterialTheme.typography.titleLarge)
                        Text(GameEngine.resultSummary(state))
                        Button(onClick = {
                            state = GameEngine.newGame()
                            event = GameEngine.generateWeeklyEvent(state)
                        }) {
                            Text("Start New Campaign")
                        }
                    }
                }
            } else {
                EventCard(event = event, onPick = { option ->
                    state = GameEngine.applyChoice(state, option)
                    if (!GameEngine.isFinished(state)) {
                        event = GameEngine.generateWeeklyEvent(state)
                    }
                })
            }

            Text("Campaign Log", style = MaterialTheme.typography.titleMedium)
            LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                items(state.log.reversed()) { line ->
                    Text("• $line")
                }
            }
        }
    }
}

@Composable
private fun Header(state: GameState) {
    val c = state.candidate
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Week ${state.week.coerceAtMost(state.totalWeeks)} / ${state.totalWeeks}", style = MaterialTheme.typography.titleLarge)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Funds: ${c.funds}")
                Text("Momentum: ${c.momentum}")
                Text("Scandal: ${c.scandalRisk}")
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Media: ${c.mediaTrust}")
                Text("Alliance: ${c.allianceLoyalty}")
                Text("Ethics: ${c.ethicsScore}")
            }
        }
    }
}

@Composable
private fun EventCard(event: WeeklyEvent, onPick: (com.example.electiongame.model.ChoiceOption) -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(event.context.name, style = MaterialTheme.typography.titleMedium)
            Text(event.prompt)
            event.options.forEach { option ->
                Button(
                    onClick = { onPick(option) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(option.title)
                }
                Text(option.description, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
