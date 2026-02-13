package com.example.electiongame

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.electiongame.engine.GameEngine
import com.example.electiongame.model.ChoiceOption
import com.example.electiongame.model.GameState

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface {
                    ElectionGameScreen()
                }
            }
        }
    }
}

@Composable
private fun ElectionGameScreen() {
    var state by remember { mutableStateOf(GameEngine.newGame()) }
    var event by remember { mutableStateOf(GameEngine.generateWeeklyEvent(state)) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Election Simulation",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            )
        },
        modifier = Modifier.fillMaxSize()
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.surface),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item { Header(state) }

            if (GameEngine.isFinished(state)) {
                item {
                    ResultCard(
                        summary = GameEngine.resultSummary(state),
                        onRestart = {
                            state = GameEngine.newGame()
                            event = GameEngine.generateWeeklyEvent(state)
                        }
                    )
                }
            } else {
                item {
                    EventCard(
                        week = state.week,
                        prompt = event.prompt,
                        context = event.context.name,
                        options = event.options,
                        onPick = { option ->
                            state = GameEngine.applyChoice(state, option)
                            if (!GameEngine.isFinished(state)) event = GameEngine.generateWeeklyEvent(state)
                        }
                    )
                }
            }

            item {
                DemographicPanel(state)
            }

            item {
                Text(
                    text = "Campaign Log",
                    modifier = Modifier.padding(horizontal = 12.dp),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }

            items(state.log.reversed()) { line ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Text(
                        text = line,
                        modifier = Modifier.padding(10.dp),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

@Composable
private fun Header(state: GameState) {
    val candidate = state.candidate
    val progress = (state.week - 1).coerceAtMost(state.totalWeeks).toFloat() / state.totalWeeks

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("Week ${state.week.coerceAtMost(state.totalWeeks)} of ${state.totalWeeks}", fontWeight = FontWeight.Bold)
            LinearProgressIndicator(progress = { progress }, modifier = Modifier.fillMaxWidth())

            MetricRow("Funds", candidate.funds, "Momentum", candidate.momentum, "Scandal", candidate.scandalRisk)
            MetricRow("Media", candidate.mediaTrust, "Alliance", candidate.allianceLoyalty, "Ethics", candidate.ethicsScore)
        }
    }
}

@Composable
private fun MetricRow(k1: String, v1: Int, k2: String, v2: Int, k3: String, v3: Int) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        MetricChip(k1, v1)
        MetricChip(k2, v2)
        MetricChip(k3, v3)
    }
}

@Composable
private fun MetricChip(label: String, value: Int) {
    AssistChip(
        onClick = {},
        label = { Text("$label: $value") },
        colors = AssistChipDefaults.assistChipColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
    )
}

@Composable
private fun EventCard(
    week: Int,
    context: String,
    prompt: String,
    options: List<ChoiceOption>,
    onPick: (ChoiceOption) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Week $week • $context", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(prompt)
            HorizontalDivider()
            options.forEach { option ->
                OptionCard(option, onPick)
            }
        }
    }
}

@Composable
private fun OptionCard(option: ChoiceOption, onPick: (ChoiceOption) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (option.unethical) Color(0xFFFFEBEE) else MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(option.title, modifier = Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                if (option.unethical) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFD32F2F), shape = MaterialTheme.shapes.small)
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text("High Risk", color = Color.White, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
            Text(option.description, style = MaterialTheme.typography.bodySmall)
            Button(onClick = { onPick(option) }, modifier = Modifier.width(180.dp)) {
                Text("Choose this strategy")
            }
        }
    }
}

@Composable
private fun DemographicPanel(state: GameState) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Demographic Support", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            state.candidate.demographics.values.sortedByDescending { it.support }.forEach { demo ->
                Text("${demo.name}: ${demo.support}% (Loyalty ${demo.loyalty}%)", style = MaterialTheme.typography.bodySmall)
                LinearProgressIndicator(
                    progress = { demo.support / 100f },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@Composable
private fun ResultCard(summary: String, onRestart: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Election Complete", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(summary)
            Button(onClick = onRestart) {
                Text("Start New Campaign")
            }
        }
    }
}
