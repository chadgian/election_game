package com.example.electiongame.model

enum class Ideology { PROGRESSIVE, MODERATE, CONSERVATIVE }

data class Demographic(
    val id: String,
    val name: String,
    val turnoutWeight: Double,
    val donationStrength: Double,
    val volatility: Double,
    val policyBias: Ideology,
    val scandalSensitivity: Double,
    val rhetoricSensitivity: Double,
    val support: Int = 50,
    val loyalty: Int = 50
)

data class CandidateAttributes(
    val ideology: Ideology,
    val charisma: Int,
    val integrity: Int,
    val experience: Int,
    val debateSkill: Int,
    val mediaSavviness: Int,
    val donorAppeal: Int,
    val grassrootsAppeal: Int,
    val riskTolerance: Int,
    val moralCompass: Int,
    val incumbent: Boolean
)

data class Candidate(
    val id: String,
    val name: String,
    val party: String,
    val attributes: CandidateAttributes,
    val funds: Int = 250,
    val momentum: Int = 50,
    val scandalRisk: Int = 10,
    val mediaTrust: Int = 50,
    val legalHeat: Int = 0,
    val allianceLoyalty: Int = 50,
    val ethicsScore: Int = 70,
    val demographics: Map<String, Demographic>
)

enum class ContextType { DEBATE, SOCIAL, FUNDRAISING, ALLIANCE, LEGAL, CRISIS, INTERNAL }

data class ChoiceEffect(
    val supportShift: Map<String, Int> = emptyMap(),
    val loyaltyShift: Map<String, Int> = emptyMap(),
    val fundsDelta: Int = 0,
    val momentumDelta: Int = 0,
    val scandalRiskDelta: Int = 0,
    val integrityDelta: Int = 0,
    val mediaTrustDelta: Int = 0,
    val allianceDelta: Int = 0,
    val legalHeatDelta: Int = 0,
    val delayedFlag: String? = null
)

data class ChoiceOption(
    val id: String,
    val title: String,
    val description: String,
    val unethical: Boolean,
    val effect: ChoiceEffect
)

data class WeeklyEvent(
    val week: Int,
    val context: ContextType,
    val prompt: String,
    val options: List<ChoiceOption>
)

data class GameState(
    val week: Int,
    val totalWeeks: Int,
    val candidate: Candidate,
    val log: List<String>,
    val delayedConsequences: Map<Int, List<ChoiceEffect>>,
    val randomSeed: Int
)
