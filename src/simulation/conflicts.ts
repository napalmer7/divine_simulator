/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Army, City, Civilization, Race, WorldCell } from '../types/game';
import { roll2d6 } from './dawnOfWorldsRules';

export interface BattleParticipant {
  army: Army;
  civilization: Civilization;
  race: Race;
  techBonus: number;
  terrainBonus: number;
  wallBonus: number;
  fatiguePenalty: number;
  racialBonus: number;
  totalModifier: number;
  diceRoll: [number, number];
  rollTotal: number;
  finalScore: number;
}

export interface BattleResult {
  attacker: BattleParticipant;
  defender: BattleParticipant;
  winner: 'attacker' | 'defender' | 'draw';
  margin: number;
  narrative: string;
  targetCitySacked: boolean;
  targetCityDamaged: boolean;
  attackerArmyDestroyed: boolean;
  defenderArmyDestroyed: boolean;
}

/**
 * Resolves a battle between an attacking army and a defending force (army or fortified city garrison)
 * following Dawn of Worlds official rules (Page 9-10).
 */
export function resolveBattle(
  attackerArmy: Army,
  attackerCiv: Civilization,
  attackerRace: Race,
  defenderArmy: Army | null,
  defenderCiv: Civilization,
  defenderRace: Race,
  targetCell: WorldCell,
  targetCity: City | null
): BattleResult {
  // 1. Calculate Attacker Bonuses
  const attackerTechBonus = attackerCiv.technologies.filter(
    (t) =>
      t.includes('Smithing') ||
      t.includes('War Magic') ||
      t.includes('Equestrian') ||
      t.includes('Runecraft')
  ).length;

  const attackerRacialBonus = attackerRace.militaryBonus || 0;
  const attackerFatiguePenalty = attackerArmy.consecutiveBattles; // -1 per previous battle
  const attackerTotalMod = attackerTechBonus + attackerRacialBonus - attackerFatiguePenalty;

  const attackerRoll = roll2d6();
  const attackerRollSum = attackerRoll[0] + attackerRoll[1];
  const attackerFinalScore = attackerRollSum + attackerTotalMod;

  const attackerParticipant: BattleParticipant = {
    army: attackerArmy,
    civilization: attackerCiv,
    race: attackerRace,
    techBonus: attackerTechBonus,
    terrainBonus: 0,
    wallBonus: 0,
    fatiguePenalty: attackerFatiguePenalty,
    racialBonus: attackerRacialBonus,
    totalModifier: attackerTotalMod,
    diceRoll: attackerRoll,
    rollTotal: attackerRollSum,
    finalScore: attackerFinalScore,
  };

  // 2. Calculate Defender Bonuses
  const defenderTechBonus = defenderCiv.technologies.filter(
    (t) =>
      t.includes('Smithing') ||
      t.includes('War Magic') ||
      t.includes('Masonry') ||
      t.includes('Runecraft')
  ).length;

  let defenderTerrainBonus = 0;
  if (targetCell.terrain === 'mountains' || targetCell.terrain === 'hills') {
    defenderTerrainBonus = 1; // High ground advantage
  }

  let defenderWallBonus = 0;
  if (targetCity && targetCity.defense > 0) {
    defenderWallBonus = Math.min(3, targetCity.defense); // Fortress wall defense bonus
  }

  const defenderFatiguePenalty = defenderArmy ? defenderArmy.consecutiveBattles : 0;
  const defenderRacialBonus = defenderRace.militaryBonus || 0;
  const defenderTotalMod =
    defenderTechBonus + defenderTerrainBonus + defenderWallBonus + defenderRacialBonus - defenderFatiguePenalty;

  const defenderRoll = roll2d6();
  const defenderRollSum = defenderRoll[0] + defenderRoll[1];
  const defenderFinalScore = defenderRollSum + defenderTotalMod;

  const defenderMockArmy: Army = defenderArmy || {
    id: `garrison_${targetCity?.id || 'cell'}`,
    name: `${targetCity?.name || 'Provincial'} Garrison`,
    civilizationId: defenderCiv.id,
    creatorDeityId: defenderCiv.creatorDeityId,
    cityOriginId: targetCity?.id || '',
    cellIndex: targetCell.index,
    lat: targetCell.lat,
    lon: targetCell.lon,
    targetCellIndex: null,
    targetCityId: null,
    strength: targetCity ? Math.max(2, Math.floor(targetCity.population / 150)) : 2,
    consecutiveBattles: 0,
  };

  const defenderParticipant: BattleParticipant = {
    army: defenderMockArmy,
    civilization: defenderCiv,
    race: defenderRace,
    techBonus: defenderTechBonus,
    terrainBonus: defenderTerrainBonus,
    wallBonus: defenderWallBonus,
    fatiguePenalty: defenderFatiguePenalty,
    racialBonus: defenderRacialBonus,
    totalModifier: defenderTotalMod,
    diceRoll: defenderRoll,
    rollTotal: defenderRollSum,
    finalScore: defenderFinalScore,
  };

  const margin = Math.abs(attackerFinalScore - defenderFinalScore);
  let winner: 'attacker' | 'defender' | 'draw' = 'draw';
  let targetCitySacked = false;
  let targetCityDamaged = false;
  let attackerArmyDestroyed = false;
  let defenderArmyDestroyed = false;

  let narrative = '';

  if (attackerFinalScore > defenderFinalScore) {
    winner = 'attacker';
    defenderArmyDestroyed = true;
    if (targetCity) {
      if (margin >= 4) {
        targetCitySacked = true;
        narrative = `The armies of ${attackerCiv.name} (${attackerRace.name}) shattered the defenses of ${targetCity.name}! The city was besieged and heavily plundered.`;
      } else {
        targetCityDamaged = true;
        narrative = `The forces of ${attackerCiv.name} achieved a hard-fought victory at ${targetCity.name}, breaching the perimeter and scattering the defending garrisons.`;
      }
    } else {
      narrative = `The marching vanguard of ${attackerCiv.name} decisively routed ${defenderCiv.name}'s defenders in the open field (Score: ${attackerFinalScore} vs ${defenderFinalScore}).`;
    }
  } else if (defenderFinalScore > attackerFinalScore) {
    winner = 'defender';
    attackerArmyDestroyed = true;
    if (targetCity) {
      narrative = `The valiant defenders of ${targetCity.name} (${defenderCiv.name}) held firm behind their bastions! The invading force of ${attackerCiv.name} was repelled with heavy losses.`;
    } else {
      narrative = `The defenders of ${defenderCiv.name} utilized favorable terrain and martial discipline to crush the invading army of ${attackerCiv.name}.`;
    }
  } else {
    winner = 'draw';
    narrative = `A bloody, inconclusive clash erupted between ${attackerCiv.name} and ${defenderCiv.name}. Both hosts suffered immense casualties and broke off engagement.`;
  }

  return {
    attacker: attackerParticipant,
    defender: defenderParticipant,
    winner,
    margin,
    narrative,
    targetCitySacked,
    targetCityDamaged,
    attackerArmyDestroyed,
    defenderArmyDestroyed,
  };
}
