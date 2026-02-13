import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  applyChoice,
  generateWeeklyEvent,
  isFinished,
  newGame,
  resultSummary,
} from './game/gameEngine';

const Metric = ({label, value}) => (
  <View style={styles.metricChip}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

export default function App() {
  const [state, setState] = useState(() => newGame());
  const event = useMemo(
    () => (isFinished(state) ? null : generateWeeklyEvent(state)),
    [state],
  );

  const chooseOption = option => setState(prev => applyChoice(prev, option));

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Election Game</Text>
        <Text style={styles.subtitle}>
          Week {Math.min(state.week, state.totalWeeks)} of {state.totalWeeks}
        </Text>

        <View style={styles.metricRow}>
          <Metric label="Funds" value={state.candidate.funds} />
          <Metric label="Momentum" value={state.candidate.momentum} />
          <Metric label="Scandal" value={state.candidate.scandalRisk} />
        </View>
        <View style={styles.metricRow}>
          <Metric label="Media" value={state.candidate.mediaTrust} />
          <Metric label="Alliance" value={state.candidate.allianceLoyalty} />
          <Metric label="Ethics" value={state.candidate.ethicsScore} />
        </View>

        {!isFinished(state) && event ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{event.context}</Text>
            <Text style={styles.prompt}>{event.prompt}</Text>
            {event.options.map(option => (
              <View
                key={option.id}
                style={[styles.option, option.unethical && styles.optionDanger]}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionText}>{option.description}</Text>
                <TouchableOpacity
                  onPress={() => chooseOption(option)}
                  style={styles.button}>
                  <Text style={styles.buttonText}>Choose Strategy</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Election Complete</Text>
            <Text style={styles.prompt}>{resultSummary(state)}</Text>
            <TouchableOpacity onPress={() => setState(newGame())} style={styles.button}>
              <Text style={styles.buttonText}>Start New Campaign</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Demographics</Text>
          {Object.values(state.candidate.demographics)
            .sort((a, b) => b.support - a.support)
            .map(demo => (
              <Text key={demo.id} style={styles.optionText}>
                {demo.name}: {demo.support}% support • {demo.loyalty}% loyalty
              </Text>
            ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Campaign Log</Text>
          {state.log.slice().reverse().map((entry, idx) => (
            <Text key={`${entry}-${idx}`} style={styles.optionText}>
              • {entry}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#0f172a'},
  content: {padding: 16, gap: 12},
  title: {fontSize: 28, color: '#f8fafc', fontWeight: '700'},
  subtitle: {fontSize: 14, color: '#cbd5e1', marginBottom: 8},
  metricRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  metricChip: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {fontSize: 12, color: '#94a3b8'},
  metricValue: {fontSize: 16, color: '#f8fafc', fontWeight: '600'},
  card: {backgroundColor: '#1e293b', borderRadius: 12, padding: 12, gap: 8},
  cardTitle: {fontSize: 18, color: '#f8fafc', fontWeight: '700'},
  prompt: {color: '#e2e8f0', fontSize: 14},
  option: {backgroundColor: '#334155', borderRadius: 10, padding: 10, gap: 6},
  optionDanger: {borderWidth: 1, borderColor: '#ef4444'},
  optionTitle: {color: '#f8fafc', fontWeight: '700'},
  optionText: {color: '#cbd5e1', fontSize: 13},
  button: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: '#eff6ff', fontWeight: '700'},
});
