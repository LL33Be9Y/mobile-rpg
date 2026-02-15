// Dialogue Engine - processes dialogue trees, conditions, and effects
const DialogueEngine = (() => {
  let currentDialogue = null;
  let currentNodeId = null;
  let onDialogueUpdate = null;
  let onDialogueEnd = null;

  function start(dialogue, startNodeId, callbacks) {
    currentDialogue = dialogue;
    currentNodeId = startNodeId || 'start';
    onDialogueUpdate = callbacks.onUpdate;
    onDialogueEnd = callbacks.onEnd;
    processNode();
  }

  function processNode() {
    if (!currentDialogue || !currentNodeId) {
      if (onDialogueEnd) onDialogueEnd();
      return;
    }

    const node = currentDialogue.nodes[currentNodeId];
    if (!node) {
      console.error('Dialogue node not found:', currentNodeId);
      if (onDialogueEnd) onDialogueEnd();
      return;
    }

    // Apply any effects from reaching this node
    if (node.effects) {
      applyEffects(node.effects);
    }

    // Filter choices by conditions
    const availableChoices = (node.choices || []).filter(choice => {
      if (!choice.condition) return true;
      return evaluateCondition(choice.condition);
    });

    if (onDialogueUpdate) {
      onDialogueUpdate({
        speaker: node.speaker,
        portrait: node.portrait,
        text: node.text,
        choices: availableChoices,
        isEnd: availableChoices.length === 0 && !node.next,
      });
    }

    // Auto-advance if no choices and has next
    if (availableChoices.length === 0 && node.next) {
      currentNodeId = node.next;
    }
  }

  function selectChoice(choiceIndex) {
    const node = currentDialogue.nodes[currentNodeId];
    const availableChoices = (node.choices || []).filter(choice => {
      if (!choice.condition) return true;
      return evaluateCondition(choice.condition);
    });

    const choice = availableChoices[choiceIndex];
    if (!choice) return;

    // Apply choice effects
    if (choice.effects) {
      applyEffects(choice.effects);
    }

    if (choice.next) {
      currentNodeId = choice.next;
      processNode();
    } else {
      if (onDialogueEnd) onDialogueEnd();
    }
  }

  function advance() {
    const node = currentDialogue.nodes[currentNodeId];
    if (node && node.next) {
      currentNodeId = node.next;
      processNode();
    } else {
      if (onDialogueEnd) onDialogueEnd();
    }
  }

  function applyEffects(effects) {
    for (const effect of effects) {
      GameState.applyEffect(effect);
    }
  }

  function evaluateCondition(condition) {
    return GameState.checkCondition(condition);
  }

  function isActive() {
    return currentDialogue !== null;
  }

  function end() {
    currentDialogue = null;
    currentNodeId = null;
  }

  return { start, selectChoice, advance, isActive, end };
})();
