package com.example.electiongame.engine

import com.example.electiongame.model.Candidate
import com.example.electiongame.model.CandidateAttributes
import com.example.electiongame.model.ChoiceEffect
import com.example.electiongame.model.ChoiceOption
import com.example.electiongame.model.ContextType
import com.example.electiongame.model.Demographic
import com.example.electiongame.model.GameState
import com.example.electiongame.model.Ideology
import com.example.electiongame.model.WeeklyEvent
import kotlin.math.roundToInt
import kotlin.random.Random

object GameEngine {
    private const val TOTAL_WEEKS = 10

    private val defaultDemographics = listOf(
        demographic("youth", "Youth Vote", 0.16, 0.35, 0.8, Ideology.PROGRESSIVE, 0.7, 0.9),
        demographic("women", "Women", 0.19, 0.55, 0.6, Ideology.MODERATE, 0.8, 0.7),
        demographic("old_cons", "Old Conservatives", 0.14, 0.75, 0.4, Ideology.CONSERVATIVE, 0.9, 0.4),
        demographic("suburbs", "Middle-Class Suburbs", 0.15, 0.7, 0.5, Ideology.MODERATE, 0.7, 0.5),
        demographic("business", "Businessmen", 0.07, 0.95, 0.35, Ideology.CONSERVATIVE, 0.5, 0.3),
        demographic("brokers", "Big Power Brokers", 0.03, 1.0, 0.25, Ideology.CONSERVATIVE, 0.6, 0.2),
        demographic("black", "Black Voters", 0.1, 0.4, 0.7, Ideology.PROGRESSIVE, 0.8, 0.8),
        demographic("latino", "Latino Voters", 0.09, 0.45, 0.75, Ideology.MODERATE, 0.7, 0.7),
        demographic("working", "Working Class", 0.13, 0.5, 0.65, Ideology.MODERATE, 0.6, 0.7),
        demographic("urban", "Urban Professionals", 0.08, 0.65, 0.7, Ideology.PROGRESSIVE, 0.6, 0.8),
        demographic("rural", "Rural Voters", 0.12, 0.55, 0.45, Ideology.CONSERVATIVE, 0.5, 0.4)
    )

    fun newGame(seed: Int = Random.nextInt()): GameState {
        val random = Random(seed)
        val candidate = Candidate(
            id = "player",
            name = "Player Candidate",
            party = "Unity Party",
            attributes = CandidateAttributes(
                ideology = Ideology.MODERATE,
                charisma = 62,
                integrity = 67,
                experience = 58,
                debateSkill = 61,
                mediaSavviness = 63,
                donorAppeal = 55,
                grassrootsAppeal = 60,
                riskTolerance = 54,
                moralCompass = 71,
                incumbent = random.nextBoolean()
            ),
            demographics = defaultDemographics.associateBy { it.id }
        )

        return GameState(
            week = 1,
            totalWeeks = TOTAL_WEEKS,
            candidate = candidate,
            log = listOf("Campaign launched. Incumbent: ${candidate.attributes.incumbent}"),
            delayedConsequences = emptyMap()
        )
    }

    fun generateWeeklyEvent(state: GameState, random: Random = Random(state.week * 104729)): WeeklyEvent {
        val context = when (state.week) {
            1 -> ContextType.FUNDRAISING
            3, 4 -> ContextType.ALLIANCE
            6, 9 -> ContextType.DEBATE
            else -> ContextType.entries[random.nextInt(ContextType.entries.size)]
        }
        val pool = buildChoicePool(context, state, random)
        val pickCount = random.nextInt(3, 6)
        val options = pool.shuffled(random).take(pickCount)
        return WeeklyEvent(
            week = state.week,
            context = context,
            prompt = promptFor(context),
            options = options
        )
    }

    fun applyChoice(state: GameState, option: ChoiceOption, random: Random = Random(state.week * 99991)): GameState {
        var nextCandidate = state.candidate
        var log = state.log.toMutableList()
        val updatedDemographics = nextCandidate.demographics.toMutableMap()

        option.effect.supportShift.forEach { (id, value) ->
            val group = updatedDemographics[id] ?: return@forEach
            val scaled = (value * group.volatility).roundToInt()
            updatedDemographics[id] = group.copy(support = clamp(group.support + scaled))
        }

        option.effect.loyaltyShift.forEach { (id, value) ->
            val group = updatedDemographics[id] ?: return@forEach
            updatedDemographics[id] = group.copy(loyalty = clamp(group.loyalty + value))
        }

        val consequencePenalty = if (option.unethical) random.nextInt(0, 6) else 0
        nextCandidate = nextCandidate.copy(
            funds = (nextCandidate.funds + option.effect.fundsDelta).coerceAtLeast(0),
            momentum = clamp(nextCandidate.momentum + option.effect.momentumDelta),
            scandalRisk = clamp(nextCandidate.scandalRisk + option.effect.scandalRiskDelta + consequencePenalty),
            mediaTrust = clamp(nextCandidate.mediaTrust + option.effect.mediaTrustDelta),
            legalHeat = clamp(nextCandidate.legalHeat + option.effect.legalHeatDelta),
            allianceLoyalty = clamp(nextCandidate.allianceLoyalty + option.effect.allianceDelta),
            ethicsScore = clamp(nextCandidate.ethicsScore + option.effect.integrityDelta - if (option.unethical) 8 else 0),
            demographics = updatedDemographics
        )

        val delayed = state.delayedConsequences.toMutableMap()
        if (option.effect.delayedFlag != null) {
            val delayWeek = (state.week + random.nextInt(1, 4)).coerceAtMost(state.totalWeeks)
            val delayedEffect = ChoiceEffect(
                momentumDelta = -random.nextInt(1, 6),
                scandalRiskDelta = random.nextInt(1, 7),
                mediaTrustDelta = -random.nextInt(1, 5)
            )
            delayed[delayWeek] = (delayed[delayWeek] ?: emptyList()) + delayedEffect
            log.add("A delayed consequence has been seeded for week $delayWeek.")
        }

        delayed[state.week]?.forEach {
            nextCandidate = nextCandidate.copy(
                momentum = clamp(nextCandidate.momentum + it.momentumDelta),
                scandalRisk = clamp(nextCandidate.scandalRisk + it.scandalRiskDelta),
                mediaTrust = clamp(nextCandidate.mediaTrust + it.mediaTrustDelta)
            )
            log.add("Past actions resurfaced this week.")
        }

        val scandalRoll = random.nextInt(100)
        if (scandalRoll < nextCandidate.scandalRisk / 2) {
            nextCandidate = nextCandidate.copy(
                momentum = clamp(nextCandidate.momentum - random.nextInt(3, 11)),
                mediaTrust = clamp(nextCandidate.mediaTrust - random.nextInt(3, 10))
            )
            log.add("A scandal story broke in the media cycle.")
        }

        log.add("Week ${state.week}: ${option.title}")
        return state.copy(
            week = (state.week + 1).coerceAtMost(state.totalWeeks + 1),
            candidate = nextCandidate,
            log = log.takeLast(24),
            delayedConsequences = delayed
        )
    }

    fun isFinished(state: GameState): Boolean = state.week > state.totalWeeks

    fun resultSummary(state: GameState): String {
        val demoScore = state.candidate.demographics.values.sumOf { it.support * it.turnoutWeight }.roundToInt()
        val stability = (state.candidate.mediaTrust + state.candidate.ethicsScore + state.candidate.allianceLoyalty) / 3
        val finalScore = demoScore + state.candidate.momentum + (state.candidate.funds / 10) + stability - state.candidate.scandalRisk
        val verdict = if (finalScore >= 145) "Victory" else "Defeat"
        return "$verdict | Score $finalScore | Popular energy ${state.candidate.momentum} | Scandal risk ${state.candidate.scandalRisk}"
    }

    private fun buildChoicePool(context: ContextType, state: GameState, random: Random): List<ChoiceOption> {
        val tones = listOf("principled", "pragmatic", "aggressive", "conciliatory", "populist")
        val issues = listOf("tax", "jobs", "security", "healthcare", "education", "climate", "corruption", "housing", "tech", "immigration")
        val pool = mutableListOf<ChoiceOption>()
        repeat(50) { idx ->
            val tone = tones[idx % tones.size]
            val issue = issues[(idx + random.nextInt(issues.size)) % issues.size]
            val risky = tone == "aggressive" || (idx % 11 == 0)
            pool.add(
                ChoiceOption(
                    id = "${context.name.lowercase()}_$idx",
                    title = "${context.name.lowercase().replaceFirstChar { it.uppercase() }}: ${tone.replaceFirstChar { it.uppercase() }} $issue push",
                    description = "Frame a $tone stance on $issue with tradeoffs in trust, money, and turnout.",
                    unethical = risky && random.nextBoolean(),
                    effect = synthesiseEffect(context, tone, issue, state, random)
                )
            )
        }
        return pool
    }

    private fun synthesiseEffect(
        context: ContextType,
        tone: String,
        issue: String,
        state: GameState,
        random: Random
    ): ChoiceEffect {
        val progBoost = if (tone in listOf("principled", "populist")) 4 else 1
        val consBoost = if (tone == "aggressive") 4 else 1
        val moderateBoost = if (tone == "pragmatic" || tone == "conciliatory") 4 else 1
        val support = mutableMapOf(
            "youth" to progBoost,
            "urban" to progBoost,
            "black" to (progBoost - 1),
            "latino" to moderateBoost,
            "suburbs" to moderateBoost,
            "working" to moderateBoost,
            "old_cons" to consBoost,
            "rural" to consBoost,
            "business" to if (issue == "tax") -consBoost else consBoost,
            "brokers" to if (context == ContextType.ALLIANCE) 5 else 1,
            "women" to if (tone == "aggressive") -2 else 2
        )

        if (state.candidate.attributes.incumbent && context == ContextType.DEBATE) {
            support["suburbs"] = (support["suburbs"] ?: 0) - 2
        }

        return ChoiceEffect(
            supportShift = support,
            fundsDelta = random.nextInt(-35, 51) + if (context == ContextType.FUNDRAISING) 20 else 0,
            momentumDelta = random.nextInt(-8, 11) + if (context == ContextType.DEBATE) 3 else 0,
            scandalRiskDelta = random.nextInt(-3, 8) + if (tone == "aggressive") 2 else 0,
            integrityDelta = if (tone == "principled") 4 else if (tone == "aggressive") -3 else 0,
            mediaTrustDelta = if (tone == "conciliatory") 3 else random.nextInt(-4, 5),
            allianceDelta = if (context == ContextType.ALLIANCE) random.nextInt(-8, 12) else 0,
            legalHeatDelta = if (context == ContextType.LEGAL) random.nextInt(2, 11) else 0,
            delayedFlag = if (random.nextInt(100) < 22) "echo_$issue" else null
        )
    }

    private fun promptFor(context: ContextType): String = when (context) {
        ContextType.DEBATE -> "Debate night: choose a stance under pressure."
        ContextType.SOCIAL -> "Social media strategy meeting: what tone drives this week?"
        ContextType.FUNDRAISING -> "Finance director asks you to pick a fundraising route."
        ContextType.ALLIANCE -> "A coalition offer arrives with private and public terms."
        ContextType.LEGAL -> "Legal team proposes action against an opponent narrative."
        ContextType.CRISIS -> "A breaking crisis is dominating all channels."
        ContextType.INTERNAL -> "Internal conflict erupts between advisors and donors."
    }

    private fun clamp(value: Int): Int = value.coerceIn(0, 100)

    private fun demographic(
        id: String,
        name: String,
        turnoutWeight: Double,
        donationStrength: Double,
        volatility: Double,
        policyBias: Ideology,
        scandalSensitivity: Double,
        rhetoricSensitivity: Double
    ): Demographic = Demographic(
        id = id,
        name = name,
        turnoutWeight = turnoutWeight,
        donationStrength = donationStrength,
        volatility = volatility,
        policyBias = policyBias,
        scandalSensitivity = scandalSensitivity,
        rhetoricSensitivity = rhetoricSensitivity
    )
}
