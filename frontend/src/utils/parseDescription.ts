export interface Questionnaire {
  whatIsThisProgram: string;
  whoIsThisFor: string;
  whatWillYouLearn: string;
  topicsCovered: string;
  mediumOfLanguage: string;
  prerequisites?: string;
  takeaways?: string;
  toolsGiven?: string;
}

const QUESTIONNAIRE_MARKER = "\n\n--- QUESTIONNAIRE ---\n";

export function serializeDescription(description: string, questionnaire: Questionnaire): string {
  return description.trim() + QUESTIONNAIRE_MARKER + JSON.stringify(questionnaire);
}

export function parseDescription(rawDescription: string): {
  description: string;
  questionnaire: Questionnaire | null;
} {
  if (!rawDescription) {
    return { description: "", questionnaire: null };
  }
  const parts = rawDescription.split(QUESTIONNAIRE_MARKER);
  if (parts.length < 2) {
    return { description: rawDescription, questionnaire: null };
  }
  try {
    const questionnaire = JSON.parse(parts[1]);
    return {
      description: parts[0],
      questionnaire,
    };
  } catch (e) {
    return { description: rawDescription, questionnaire: null };
  }
}
