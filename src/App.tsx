/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AgeId,
  AGES,
  Army,
  Avatar,
  City,
  Civilization,
  ClimateType,
  CustomMiracleTemplate,
  Deity,
  HistoryLogEntry,
  MapViewMode,
  OrderItem,
  Race,
  TerrainType,
  TerritorialConflict,
  TradeRoute,
  WorldCell,
  WorldStructureType,
  SavedGameSlot,
} from './types/game';
import {
  DAWN_OF_WORLDS_COSTS,
  calculateRoundPower,
  calculateShapingCost,
  calculateMultiCellCost,
  ShapingScope,
  AVAILABLE_TECHNOLOGIES,
  ActionPowerType,
} from './simulation/dawnOfWorldsRules';
import {
  applyCascadingTerrainModification,
  applyCascadingClimateModification,
  applyTerrainModification,
  generateInitialWorld,
  getAdjacentCellIndices,
  areCellsAdjacent,
} from './simulation/worldGrid';
import { INITIAL_DEITIES, executeNpcTurn, buildCustomPantheon } from './simulation/npcDeities';
import { applyMiracle } from './simulation/miracles';
import {
  calculateTradeRoutes,
  detectTerritorialFriction,
  simulatePopulationAndGrowth,
} from './simulation/geopolitics';
import { resolveBattle, BattleResult } from './simulation/conflicts';

import { WorldGlobe } from './components/WorldGlobe';
import { FlatMapAtlas } from './components/FlatMapAtlas';
import { TopStatusBar } from './components/TopStatusBar';
import { ControlDock } from './components/ControlDock';
import { RaceGeneratorModal } from './components/RaceGeneratorModal';
import { MiracleWeaverModal } from './components/MiracleWeaverModal';
import { BattleModal } from './components/BattleModal';
import { ChronicleDrawer } from './components/ChronicleDrawer';
import { PantheonDrawer } from './components/PantheonDrawer';
import { NewGameModal } from './components/NewGameModal';
import { SaveLoadModal } from './components/SaveLoadModal';

export default function App() {
  // World Grid & Entities State
  const [cells, setCells] = useState<WorldCell[]>(() => generateInitialWorld());
  const [cities, setCities] = useState<City[]>([]);
  const [civilizations, setCivilizations] = useState<Civilization[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [armies, setArmies] = useState<Army[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [tradeRoutes, setTradeRoutes] = useState<TradeRoute[]>([]);
  const [conflicts, setConflicts] = useState<TerritorialConflict[]>([]);

  // Simulation & Age State
  const [currentAge, setCurrentAge] = useState<AgeId>('1st_age_land');
  const [round, setRound] = useState<number>(1);
  const [year, setYear] = useState<number>(500);
  const [deities, setDeities] = useState<Deity[]>(INITIAL_DEITIES);
  const [turnOrder, setTurnOrder] = useState<string[]>(() => INITIAL_DEITIES.map((d) => d.id));
  const [activeDeityIndex, setActiveDeityIndex] = useState<number>(0);

  // History & Bede Chronicles
  const [history, setHistory] = useState<HistoryLogEntry[]>([
    {
      id: 'init_1',
      age: '1st_age_land',
      round: 1,
      year: 500,
      deityId: 'deity_player',
      deityName: 'The Prime Shaper',
      deityColor: '#818cf8',
      actionType: 'Cosmic Genesis',
      cost: 0,
      title: 'The First Dawn of Meglin',
      description: 'The Immortals gathered in the celestial expanse, gazing upon a young, primordial globe of churning tides and nascent stone.',
      impact: 'The First Age of Creation commenced.',
      category: 'creation',
    },
  ]);

  // UI Selection & Modals
  const [selectedCellIndices, setSelectedCellIndices] = useState<number[]>([]);
  const selectedCellIndex = selectedCellIndices[0] ?? null;
  const selectedCell = selectedCellIndex !== null && cells[selectedCellIndex] ? cells[selectedCellIndex] : null;

  const handleSelectCell = (cellIndex: number, isMultiSelect = false) => {
    if (isMultiSelect) {
      setSelectedCellIndices((prev) => {
        if (prev.includes(cellIndex)) return prev;
        if (prev.length === 0) return [cellIndex];
        // Allow selection of adjacent (or diagonally adjacent) blocks
        const isAdjacent = prev.some((existingIdx) => areCellsAdjacent(existingIdx, cellIndex));
        if (isAdjacent) {
          return [...prev, cellIndex];
        }
        return prev;
      });
    } else {
      setSelectedCellIndices([cellIndex]);
    }
  };

  const handleClearSelection = () => {
    if (selectedCellIndices.length > 1) {
      setSelectedCellIndices([selectedCellIndices[0]]);
    } else {
      setSelectedCellIndices([]);
    }
  };

  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('physical');
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [currentWorldStructure, setCurrentWorldStructure] = useState<WorldStructureType>('continental');

  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const [isMiracleModalOpen, setIsMiracleModalOpen] = useState(false);
  const [isChronicleOpen, setIsChronicleOpen] = useState(false);
  const [isPantheonOpen, setIsPantheonOpen] = useState(false);
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState(false);
  const [activeBattleResult, setActiveBattleResult] = useState<BattleResult | null>(null);

  const playerDeity = deities.find((d) => d.isPlayer) || deities[0];
  const activeDeityId = turnOrder[activeDeityIndex] || playerDeity.id;
  const activeDeity = deities.find((d) => d.id === activeDeityId) || playerDeity;

  const canAdvanceAge = round >= 5;

  // Update dynamic geopolitical state (trade & friction) whenever cities or civs change
  useEffect(() => {
    const routes = calculateTradeRoutes(cities, civilizations, cells);
    setTradeRoutes(routes);

    const frict = detectTerritorialFriction(cells, cities, civilizations, deities);
    setConflicts(frict);
  }, [cities, civilizations, cells, deities]);

  // Advance to next deity turn or complete round
  const advanceTurn = useCallback(() => {
    const nextIdx = activeDeityIndex + 1;

    if (nextIdx < turnOrder.length) {
      // Next deity in current round
      setActiveDeityIndex(nextIdx);
    } else {
      // END OF ROUND: All deities took their turn!
      // 1. Advance year and round counter
      const nextRound = round + 1;
      const nextYear = year + AGES[currentAge].yearsPerRound;
      setRound(nextRound);
      setYear(nextYear);

      // 2. Simulate demographics, population growth, and trade
      const { updatedCells, updatedCities } = simulatePopulationAndGrowth(
        cells,
        cities,
        civilizations,
        races
      );
      setCells(updatedCells);
      setCities(updatedCities);

      // 3. March armies and resolve clashes
      let currentArmiesState = [...armies];
      let currentCitiesState = [...updatedCities];

      for (let i = 0; i < currentArmiesState.length; i++) {
        const army = currentArmiesState[i];
        if (army.targetCellIndex !== null && army.targetCellIndex !== army.cellIndex) {
          // Army marches toward target
          army.cellIndex = army.targetCellIndex;
          const targetC = updatedCells[army.targetCellIndex];
          if (targetC) {
            army.lat = targetC.lat;
            army.lon = targetC.lon;
          }

          // Check for collision with enemy army or enemy city
          const enemyCity = currentCitiesState.find(
            (c) => c.cellIndex === army.cellIndex && c.civilizationId !== army.civilizationId
          );
          const enemyArmy = currentArmiesState.find(
            (a) => a.id !== army.id && a.cellIndex === army.cellIndex && a.civilizationId !== army.civilizationId
          );

          if (enemyCity || enemyArmy) {
            const attackerCiv = civilizations.find((c) => c.id === army.civilizationId);
            const attackerRace = races.find((r) => r.id === attackerCiv?.raceId);
            const defenderCiv = civilizations.find(
              (c) => c.id === (enemyArmy ? enemyArmy.civilizationId : enemyCity?.civilizationId)
            );
            const defenderRace = races.find((r) => r.id === defenderCiv?.raceId);

            if (attackerCiv && attackerRace && defenderCiv && defenderRace) {
              const result = resolveBattle(
                army,
                attackerCiv,
                attackerRace,
                enemyArmy || null,
                defenderCiv,
                defenderRace,
                targetC || cells[army.cellIndex],
                enemyCity || null
              );

              setActiveBattleResult(result);

              if (result.attackerArmyDestroyed) {
                currentArmiesState = currentArmiesState.filter((a) => a.id !== army.id);
              }
              if (result.defenderArmyDestroyed && enemyArmy) {
                currentArmiesState = currentArmiesState.filter((a) => a.id !== enemyArmy.id);
              }
              if (result.targetCitySacked && enemyCity) {
                currentCitiesState = currentCitiesState.map((c) =>
                  c.id === enemyCity.id ? { ...c, population: Math.floor(c.population * 0.5), status: 'under_siege' } : c
                );
              }

              setHistory((prev) => [
                {
                  id: `battle_${Date.now()}`,
                  age: currentAge,
                  round: nextRound,
                  year: nextYear,
                  deityId: army.creatorDeityId,
                  deityName: attackerCiv.name,
                  deityColor: attackerCiv.color,
                  actionType: 'Battle Resolution',
                  cost: 0,
                  title: `War Clashed at ${enemyCity ? enemyCity.name : 'The Frontier'}`,
                  description: result.narrative,
                  impact: `Attacker rolled ${result.attacker.finalScore} vs Defender ${result.defender.finalScore}.`,
                  category: 'conflict',
                },
                ...prev,
              ]);
            }
          }
        }
      }

      setArmies(currentArmiesState);
      setCities(currentCitiesState);

      // 4. Roll 2d6 + thrift bonus for each deity and re-order by highest roll (PDF rules page 5)
      const rolledDeities: { deity: Deity; rollSum: number }[] = [];

      const updatedDeities = deities.map((d) => {
        const { roll, rollTotal, newThriftBonus, totalGained } = calculateRoundPower(
          d.power,
          d.thriftBonus
        );
        const newPower = d.power + totalGained;
        const updatedD: Deity = {
          ...d,
          power: newPower,
          lastRoll: roll,
          thriftBonus: newThriftBonus,
        };
        rolledDeities.push({ deity: updatedD, rollSum: rollTotal });
        return updatedD;
      });

      // Highest roll goes first
      rolledDeities.sort((a, b) => b.rollSum - a.rollSum);
      const newTurnOrder = rolledDeities.map((item) => item.deity.id);

      setDeities(updatedDeities);
      setTurnOrder(newTurnOrder);
      setActiveDeityIndex(0);
    }
  }, [
    activeDeityIndex,
    turnOrder,
    round,
    year,
    currentAge,
    cells,
    cities,
    civilizations,
    races,
    armies,
    deities,
  ]);

  // Automatically execute turn if active deity is an NPC
  useEffect(() => {
    if (!activeDeity.isPlayer) {
      const timer = setTimeout(() => {
        const result = executeNpcTurn(
          activeDeity,
          currentAge,
          round,
          year,
          cells,
          cities,
          civilizations,
          races,
          armies,
          avatars,
          orders
        );

        // Update state with NPC results
        setDeities((prev) =>
          prev.map((d) => (d.id === activeDeity.id ? result.updatedDeity : d))
        );
        setCells(result.updatedCells);
        setCities(result.updatedCities);
        setCivilizations(result.updatedCivilizations);
        setRaces(result.updatedRaces);
        setArmies(result.updatedArmies);
        setAvatars(result.updatedAvatars);
        setOrders(result.updatedOrders);

        if (result.logEntries.length > 0) {
          setHistory((prev) => [...result.logEntries, ...prev]);
        }

        // Proceed to next deity turn
        advanceTurn();
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [
    activeDeity,
    currentAge,
    round,
    year,
    cells,
    cities,
    civilizations,
    races,
    armies,
    avatars,
    orders,
    advanceTurn,
  ]);

  // Player Power deduction helper
  const deductPlayerPower = (amount: number) => {
    setDeities((prev) =>
      prev.map((d) => (d.isPlayer ? { ...d, power: Math.max(0, d.power - amount) } : d))
    );
  };

  // Player Action: Cascading Shape Terrain
  const handleShapeTerrain = (terrain: TerrainType, scope: ShapingScope = 'cascade') => {
    const baseCost = DAWN_OF_WORLDS_COSTS.shape_land[currentAge];
    const singleCost = calculateShapingCost(baseCost, scope);
    const targetIndices = selectedCellIndices.length > 0
      ? selectedCellIndices
      : [selectedCellIndex !== null ? selectedCellIndex : Math.floor(cells.length / 2)];

    const totalCost = calculateMultiCellCost(singleCost, targetIndices.length);
    if (playerDeity.power < totalCost) return;

    let updated = [...cells];
    let totalAffected = 0;
    let volcanoCount = 0;
    let mountainCount = 0;
    let hillsCount = 0;
    let plainsCount = 0;
    let forestCount = 0;
    let swampCount = 0;
    let shallowsCount = 0;
    let oceanCount = 0;

    for (const idx of targetIndices) {
      const res = applyCascadingTerrainModification(updated, idx, terrain, scope);
      updated = res.updatedCells;
      totalAffected += res.summary.totalAffected;
      volcanoCount += res.summary.volcanoCount;
      mountainCount += res.summary.mountainCount;
      hillsCount += res.summary.hillsCount;
      plainsCount += res.summary.plainsCount;
      forestCount += res.summary.forestCount;
      swampCount += res.summary.swampCount;
      shallowsCount += res.summary.shallowsCount;
      oceanCount += res.summary.oceanCount;
    }

    setCells(updated);
    deductPlayerPower(totalCost);

    const firstCell = cells[targetIndices[0]];
    const log: HistoryLogEntry = {
      id: `shape_${Date.now()}`,
      age: currentAge,
      round,
      year,
      deityId: playerDeity.id,
      deityName: playerDeity.name,
      deityColor: playerDeity.color,
      actionType: 'Shape Land',
      cost: totalCost,
      title: `${playerDeity.name} Cascaded ${terrain.replace('_', ' ')}${targetIndices.length > 1 ? ` across ${targetIndices.length} blocks` : ''} (${scope.toUpperCase()})`,
      description: `Wove divine will across ${targetIndices.length} adjacent block${targetIndices.length > 1 ? 's' : ''} (${scope} scope).`,
      impact: `Transformed ${totalAffected} zones around [${firstCell.lat.toFixed(0)}°, ${firstCell.lon.toFixed(0)}°] (${volcanoCount ? `${volcanoCount} volcano, ` : ''}${mountainCount ? `${mountainCount} mountains, ` : ''}${hillsCount ? `${hillsCount} hills, ` : ''}${plainsCount ? `${plainsCount} plains, ` : ''}${forestCount ? `${forestCount} forests, ` : ''}${swampCount ? `${swampCount} swamps, ` : ''}${shallowsCount ? `${shallowsCount} coastal shallows` : ''}).`,
      category: 'creation',
    };
    setHistory((prev) => [log, ...prev]);
  };

  // Player Action: Cascading Shape Climate
  const handleShapeClimate = (climate: ClimateType, scope: ShapingScope = 'cascade') => {
    const baseCost = DAWN_OF_WORLDS_COSTS.shape_climate[currentAge];
    const singleCost = calculateShapingCost(baseCost, scope);
    const targetIndices = selectedCellIndices.length > 0
      ? selectedCellIndices
      : [selectedCellIndex !== null ? selectedCellIndex : Math.floor(cells.length / 2)];

    const totalCost = calculateMultiCellCost(singleCost, targetIndices.length);
    if (playerDeity.power < totalCost) return;

    let updated = [...cells];
    let lastSummary = '';
    for (const idx of targetIndices) {
      const res = applyCascadingClimateModification(updated, idx, climate, scope);
      updated = res.updatedCells;
      lastSummary = res.summary;
    }

    setCells(updated);
    deductPlayerPower(totalCost);

    const firstCell = cells[targetIndices[0]];
    const log: HistoryLogEntry = {
      id: `climate_${Date.now()}`,
      age: currentAge,
      round,
      year,
      deityId: playerDeity.id,
      deityName: playerDeity.name,
      deityColor: playerDeity.color,
      actionType: 'Shape Climate',
      cost: totalCost,
      title: `${playerDeity.name} Channeled ${climate.toUpperCase()} Skies${targetIndices.length > 1 ? ` across ${targetIndices.length} blocks` : ''} (${scope.toUpperCase()})`,
      description: lastSummary,
      impact: `Shifted regional climate and moisture across ${targetIndices.length} zones around [${firstCell.lat.toFixed(0)}°, ${firstCell.lon.toFixed(0)}°].`,
      category: 'creation',
    };
    setHistory((prev) => [log, ...prev]);
  };

  // Player Action: Cast / Weave Miracle
  const handleCastMiracle = (miracle: CustomMiracleTemplate) => {
    const cost = DAWN_OF_WORLDS_COSTS.custom_miracle[currentAge];
    if (playerDeity.power < cost) return;

    const targetIdx = selectedCellIndex !== null ? selectedCellIndex : Math.floor(cells.length / 2);
    const { updatedCells, logSummary } = applyMiracle(cells, targetIdx, miracle, 1);
    setCells(updatedCells);
    deductPlayerPower(cost);

    const log: HistoryLogEntry = {
      id: `miracle_${Date.now()}`,
      age: currentAge,
      round,
      year,
      deityId: playerDeity.id,
      deityName: playerDeity.name,
      deityColor: playerDeity.color,
      actionType: 'Custom Miracle',
      cost,
      title: `${playerDeity.name} Invoked ${miracle.name}`,
      description: miracle.description,
      impact: logSummary,
      category: 'miracle',
    };
    setHistory((prev) => [log, ...prev]);
  };

  // Player Action: Create Race or Subrace
  const handleCreateRace = (newRace: Race, isSubrace: boolean) => {
    const cost = isSubrace
      ? DAWN_OF_WORLDS_COSTS.create_subrace[currentAge]
      : DAWN_OF_WORLDS_COSTS.create_race[currentAge];
    if (playerDeity.power < cost) return;

    const targetIdx = selectedCellIndex !== null ? selectedCellIndex : cells.findIndex((c) => c.elevation > 0);
    const targetCell = cells[targetIdx] || cells[0];

    // Found cradle city & civilization
    const cityId = `city_player_${Date.now()}`;
    const civId = `civ_player_${Date.now()}`;

    const newCity: City = {
      id: cityId,
      name: `${newRace.name} Sanctuary`,
      civilizationId: civId,
      raceId: newRace.id,
      creatorDeityId: playerDeity.id,
      cellIndex: targetCell.index,
      lat: targetCell.lat,
      lon: targetCell.lon,
      population: 200,
      defense: 1,
      wonders: [],
      armiesStationed: 0,
      alignment: newRace.baseAlignment,
      wealth: 50,
      status: 'prospering',
    };

    const newCiv: Civilization = {
      id: civId,
      name: `Grand Realm of the ${newRace.demonym}`,
      raceId: newRace.id,
      creatorDeityId: playerDeity.id,
      capitalCityId: cityId,
      cityIds: [cityId],
      technologies: ['High Agriculture & Granaries', 'Bronze & Iron Smithing'],
      orders: [],
      alignment: newRace.baseAlignment,
      diplomacy: {},
      color: newRace.color,
    };

    setRaces((prev) => [...prev, newRace]);
    setCities((prev) => [...prev, newCity]);
    setCivilizations((prev) => [...prev, newCiv]);

    // Update target cell with city and population
    setCells((prev) =>
      prev.map((c) =>
        c.index === targetCell.index
          ? { ...c, cityId, civilizationId: civId, population: 200 }
          : c
      )
    );

    deductPlayerPower(cost);

    const log: HistoryLogEntry = {
      id: `race_${Date.now()}`,
      age: currentAge,
      round,
      year,
      deityId: playerDeity.id,
      deityName: playerDeity.name,
      deityColor: playerDeity.color,
      actionType: isSubrace ? 'Create Subrace' : 'Create Race',
      cost,
      title: `${playerDeity.name} Synthesized the ${newRace.name}`,
      description: newRace.description,
      impact: `Founded ${newCity.name} at [${targetCell.lat.toFixed(0)}°, ${targetCell.lon.toFixed(0)}°] with traits: ${newRace.traits.join(', ')}.`,
      category: 'life',
    };
    setHistory((prev) => [log, ...prev]);
  };

  // Player General Actions (Advance Civ, Command City/Race, Catastrophe, Events, Avatar)
  const handleExecuteGeneralAction = (actionType: ActionPowerType) => {
    const cost = DAWN_OF_WORLDS_COSTS[actionType][currentAge];
    if (playerDeity.power < cost) return;

    const myCiv = civilizations.find((c) => c.creatorDeityId === playerDeity.id) || civilizations[0];

    if (actionType === 'advance_civ') {
      if (!myCiv) return;
      const unresearched = AVAILABLE_TECHNOLOGIES.filter((t) => !myCiv.technologies.includes(t.name));
      if (unresearched.length === 0) return;
      const tech = unresearched[0];
      myCiv.technologies.push(tech.name);
      setCivilizations([...civilizations]);
      deductPlayerPower(cost);

      setHistory((prev) => [
        {
          id: `tech_${Date.now()}`,
          age: currentAge,
          round,
          year,
          deityId: playerDeity.id,
          deityName: playerDeity.name,
          deityColor: playerDeity.color,
          actionType: 'Advance Civilization',
          cost,
          title: `${playerDeity.name} Bestowed ${tech.name}`,
          description: `Divine inspiration bestowed upon ${myCiv.name}: ${tech.desc}.`,
          impact: tech.desc,
          category: 'civilization',
        },
        ...prev,
      ]);
    } else if (actionType === 'command_city') {
      // Raise an army or fortify walls
      if (cities.length === 0) return;
      const targetCity = cities.find((c) => c.creatorDeityId === playerDeity.id) || cities[0];

      const newArmy: Army = {
        id: `army_player_${Date.now()}`,
        name: `${playerDeity.name}'s Divine Vanguard`,
        civilizationId: targetCity.civilizationId,
        creatorDeityId: playerDeity.id,
        cityOriginId: targetCity.id,
        cellIndex: targetCity.cellIndex,
        lat: targetCity.lat,
        lon: targetCity.lon,
        targetCellIndex: null,
        targetCityId: null,
        strength: 4,
        consecutiveBattles: 0,
      };

      // If rival cities exist, target nearest rival city
      const rivalCity = cities.find((c) => c.civilizationId !== targetCity.civilizationId);
      if (rivalCity) {
        newArmy.targetCellIndex = rivalCity.cellIndex;
        newArmy.targetCityId = rivalCity.id;
      }

      setArmies((prev) => [...prev, newArmy]);
      deductPlayerPower(cost);

      setHistory((prev) => [
        {
          id: `army_${Date.now()}`,
          age: currentAge,
          round,
          year,
          deityId: playerDeity.id,
          deityName: playerDeity.name,
          deityColor: playerDeity.color,
          actionType: 'Command City',
          cost,
          title: `Mustered ${newArmy.name}`,
          description: `The war drums echoed as ${targetCity.name} mobilized a glorious host under divine mandate.`,
          impact: rivalCity ? `Marching upon ${rivalCity.name}!` : 'Stationed in defense.',
          category: 'conflict',
        },
        ...prev,
      ]);
    } else if (actionType === 'command_race') {
      // Found settlement on selected cell
      if (!selectedCell || selectedCell.elevation <= 0 || selectedCell.cityId) return;
      const myRace = races.find((r) => r.creatorDeityId === playerDeity.id) || races[0];
      if (!myRace || !myCiv) return;

      const newCityId = `city_colony_${Date.now()}`;
      const newCity: City = {
        id: newCityId,
        name: `${playerDeity.name}'s Haven`,
        civilizationId: myCiv.id,
        raceId: myRace.id,
        creatorDeityId: playerDeity.id,
        cellIndex: selectedCell.index,
        lat: selectedCell.lat,
        lon: selectedCell.lon,
        population: 120,
        defense: 1,
        wonders: [],
        armiesStationed: 0,
        alignment: myCiv.alignment,
        wealth: 20,
        status: 'prospering',
      };

      setCities((prev) => [...prev, newCity]);
      setCells((prev) =>
        prev.map((c) => (c.index === selectedCell.index ? { ...c, cityId: newCityId, population: 120 } : c))
      );
      deductPlayerPower(cost);

      setHistory((prev) => [
        {
          id: `city_${Date.now()}`,
          age: currentAge,
          round,
          year,
          deityId: playerDeity.id,
          deityName: playerDeity.name,
          deityColor: playerDeity.color,
          actionType: 'Command Race',
          cost,
          title: `Founded ${newCity.name}`,
          description: `Guided ${myRace.name} pioneers to erect the battlements of ${newCity.name}.`,
          impact: 'Established settlement and expanded sphere of control.',
          category: 'civilization',
        },
        ...prev,
      ]);
    } else if (actionType === 'purify_civ' || actionType === 'corrupt_civ') {
      const delta = actionType === 'purify_civ' ? 1 : -1;
      if (myCiv) {
        myCiv.alignment += delta;
        setCivilizations([...civilizations]);
        deductPlayerPower(cost);

        setHistory((prev) => [
          {
            id: `align_${Date.now()}`,
            age: currentAge,
            round,
            year,
            deityId: playerDeity.id,
            deityName: playerDeity.name,
            deityColor: playerDeity.color,
            actionType: actionType === 'purify_civ' ? 'Purify Civ' : 'Corrupt Civ',
            cost,
            title: `${playerDeity.name} ${delta > 0 ? 'Purified' : 'Corrupted'} ${myCiv.name}`,
            description: `Shifted moral alignment toward ${delta > 0 ? 'Sacred Virtue' : 'Dark Ambition'}.`,
            impact: `Current Alignment: ${myCiv.alignment > 0 ? `+${myCiv.alignment}` : myCiv.alignment}`,
            category: 'civilization',
          },
          ...prev,
        ]);
      }
    } else if (actionType === 'catastrophe') {
      // Apocalyptic destruction on target cell
      const targetIdx = selectedCellIndex !== null ? selectedCellIndex : cells.findIndex((c) => Boolean(c.cityId));
      if (targetIdx >= 0) {
        const c = cells[targetIdx];
        const hitCity = cities.find((ct) => ct.id === c.cityId);
        if (hitCity) {
          hitCity.population = Math.max(20, Math.floor(hitCity.population * 0.5));
          hitCity.defense = Math.max(0, hitCity.defense - 2);
          hitCity.status = 'under_siege';
          setCities([...cities]);
        }
        deductPlayerPower(cost);

        setHistory((prev) => [
          {
            id: `catastrophe_${Date.now()}`,
            age: currentAge,
            round,
            year,
            deityId: playerDeity.id,
            deityName: playerDeity.name,
            deityColor: playerDeity.color,
            actionType: 'Catastrophe',
            cost,
            title: `Apocalyptic Catastrophe Unleashed!`,
            description: `Meteors and raging seismic fires rained down upon [${c.lat.toFixed(0)}°, ${c.lon.toFixed(0)}°]!`,
            impact: hitCity ? `Inflicted 50% casualties and broke walls of ${hitCity.name}.` : 'Scorched the landscape.',
            category: 'conflict',
          },
          ...prev,
        ]);
      }
    } else if (actionType === 'create_avatar') {
      const avatarName = 'Celestial Prime Archon';
      const homeCell = selectedCell || cells.find((c) => c.elevation > 0) || cells[0];
      const newAv: Avatar = {
        id: `avatar_player`,
        name: avatarName,
        title: `Embodied Manifestation of ${playerDeity.name}`,
        deityId: playerDeity.id,
        cellIndex: homeCell.index,
        lat: homeCell.lat,
        lon: homeCell.lon,
        isAlive: true,
        actionsThisTurn: 1,
        description: 'A radiant towering celestial walking the mortal firmament.',
      };
      setAvatars((prev) => [...prev, newAv]);
      deductPlayerPower(cost);

      setHistory((prev) => [
        {
          id: `av_${Date.now()}`,
          age: currentAge,
          round,
          year,
          deityId: playerDeity.id,
          deityName: playerDeity.name,
          deityColor: playerDeity.color,
          actionType: 'Create Avatar',
          cost,
          title: `Avatar Manifested: ${avatarName}`,
          description: `The heavens parted as the living avatar of ${playerDeity.name} descended onto mortal soil.`,
          impact: 'Can perform immortal commands and lead hosts in battle.',
          category: 'avatar',
        },
        ...prev,
      ]);
    }
  };

  // Age Advancement
  const handleAdvanceAge = () => {
    if (currentAge === '1st_age_land') {
      setCurrentAge('2nd_age_races');
    } else if (currentAge === '2nd_age_races') {
      setCurrentAge('3rd_age_relations');
    }

    setHistory((prev) => [
      {
        id: `age_advance_${Date.now()}`,
        age: currentAge,
        round,
        year,
        deityId: playerDeity.id,
        deityName: 'The Divine Pantheon',
        deityColor: '#f59e0b',
        actionType: 'Age Transition',
        cost: 0,
        title: `The Dawn of the ${currentAge === '1st_age_land' ? '2nd Age of Races' : '3rd Age of Relations'}`,
        description: `By consensus of the Immortals, the world shifted into a grand new epoch of history.`,
        impact: `Power costs across the Table of Powers have shifted.`,
        category: 'creation',
      },
      ...prev,
    ]);
  };

  // Diplomatic Interactions
  const handleOfferPact = (targetDeityId: string) => {
    setDeities((prev) =>
      prev.map((d) => {
        if (d.id === targetDeityId) {
          const current = d.relationships[playerDeity.id] || 0;
          return {
            ...d,
            relationships: {
              ...d.relationships,
              [playerDeity.id]: Math.min(100, current + 25),
            },
          };
        }
        return d;
      })
    );
  };

  const handleProvokeRival = (targetDeityId: string) => {
    setDeities((prev) =>
      prev.map((d) => {
        if (d.id === targetDeityId) {
          const current = d.relationships[playerDeity.id] || 0;
          return {
            ...d,
            relationships: {
              ...d.relationships,
              [playerDeity.id]: Math.max(-100, current - 35),
            },
          };
        }
        return d;
      })
    );
  };

  const handleBestowTribute = (targetDeityId: string) => {
    if (playerDeity.power < 2) return;
    deductPlayerPower(2);
    setDeities((prev) =>
      prev.map((d) => {
        if (d.id === targetDeityId) {
          const current = d.relationships[playerDeity.id] || 0;
          return {
            ...d,
            power: d.power + 2,
            relationships: {
              ...d.relationships,
              [playerDeity.id]: Math.min(100, current + 30),
            },
          };
        }
        return d;
      })
    );

    const targetDeity = deities.find((d) => d.id === targetDeityId);
    setHistory((prev) => [
      {
        id: `tribute_${Date.now()}`,
        age: currentAge,
        round,
        year,
        deityId: playerDeity.id,
        deityName: playerDeity.name,
        deityColor: playerDeity.color,
        actionType: 'Divine Tribute',
        cost: 2,
        title: `${playerDeity.name} Bestowed Tribute to ${targetDeity?.name || 'Rival'}`,
        description: `Offered sacred celestial power points as tribute, substantially warming relations (+30).`,
        impact: `Relations improved; ${targetDeity?.name} received +2 divine power.`,
        category: 'creation',
      },
      ...prev,
    ]);
  };

  // Start New Game Handler
  const handleStartNewGame = ({
    worldStructure,
    playerDeity: newPlayerDeity,
    totalDeityCount,
    selectedNpcIds,
    customNpcs,
  }: {
    worldStructure: WorldStructureType;
    playerDeity: Deity;
    totalDeityCount: number;
    selectedNpcIds: string[];
    customNpcs?: Deity[];
  }) => {
    const newCells = generateInitialWorld(worldStructure);
    const newPantheon = buildCustomPantheon(newPlayerDeity, totalDeityCount, selectedNpcIds, customNpcs);
    const newTurnOrder = newPantheon.map((d) => d.id);

    setCurrentWorldStructure(worldStructure);
    setCells(newCells);
    setDeities(newPantheon);
    setTurnOrder(newTurnOrder);
    setActiveDeityIndex(0);
    setCities([]);
    setCivilizations([]);
    setRaces([]);
    setArmies([]);
    setAvatars([]);
    setOrders([]);
    setTradeRoutes([]);
    setConflicts([]);
    setCurrentAge('1st_age_land');
    setRound(1);
    setYear(500);
    setSelectedCellIndices([]);

    setHistory([
      {
        id: `init_${Date.now()}`,
        age: '1st_age_land',
        round: 1,
        year: 500,
        deityId: newPlayerDeity.id,
        deityName: newPlayerDeity.name,
        deityColor: newPlayerDeity.color,
        actionType: 'Cosmic Genesis',
        cost: 0,
        title: `The Cosmic Genesis of ${newPlayerDeity.name}`,
        description: `${newPlayerDeity.name} awoke in the celestial void alongside a council of ${totalDeityCount - 1} immortal rivals to sculpt a ${worldStructure} world.`,
        impact: 'The First Age of Land commenced.',
        category: 'creation',
      },
    ]);
  };

  // Load Game Handler
  const handleLoadGame = (slot: SavedGameSlot) => {
    setCells(slot.cells);
    setCities(slot.cities || []);
    setCivilizations(slot.civilizations || []);
    setRaces(slot.races || []);
    setArmies(slot.armies || []);
    setAvatars(slot.avatars || []);
    setOrders(slot.orders || []);
    setTradeRoutes(slot.tradeRoutes || []);
    setConflicts(slot.conflicts || []);
    setDeities(slot.deities);
    setTurnOrder(slot.turnOrder);
    setActiveDeityIndex(slot.activeDeityIndex);
    setCurrentAge(slot.age);
    setRound(slot.round);
    setYear(slot.year);
    setHistory(slot.history || []);
    if (slot.worldStructure) setCurrentWorldStructure(slot.worldStructure);
    if (slot.mapViewMode) setMapViewMode(slot.mapViewMode);
    if (typeof slot.is3DMode === 'boolean') setIs3DMode(slot.is3DMode);

    setHistory((prev) => [
      {
        id: `load_${Date.now()}`,
        age: slot.age,
        round: slot.round,
        year: slot.year,
        deityId: slot.playerDeityName,
        deityName: slot.playerDeityName,
        deityColor: '#fbbf24',
        actionType: 'Chronicle Restored',
        cost: 0,
        title: `Archive Loaded: ${slot.saveName}`,
        description: `World memories restored from save dated ${slot.saveDateFormatted}.`,
        impact: `Returned to Round ${slot.round}, Year ${slot.year}.`,
        category: 'creation',
      },
      ...prev,
    ]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-black text-slate-100 select-none font-sans">
      {/* Top Status Bar */}
      <TopStatusBar
        currentAge={currentAge}
        round={round}
        year={year}
        activeDeity={activeDeity}
        playerDeity={playerDeity}
        deityCount={deities.length}
        mapViewMode={mapViewMode}
        onSelectMapViewMode={setMapViewMode}
        is3DMode={is3DMode}
        onToggle3DMode={() => setIs3DMode(!is3DMode)}
        onEndPlayerTurn={advanceTurn}
        canAdvanceAge={canAdvanceAge}
        onAdvanceAge={handleAdvanceAge}
        onOpenChronicle={() => setIsChronicleOpen(true)}
        onOpenPantheon={() => setIsPantheonOpen(true)}
        onOpenNewGame={() => setIsNewGameModalOpen(true)}
        onOpenSaveLoad={() => setIsSaveLoadModalOpen(true)}
      />

      {/* Main World Viewport: Interactive 3D Globe or 2D Tabletop Atlas */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {is3DMode ? (
          <WorldGlobe
            cells={cells}
            cities={cities}
            civilizations={civilizations}
            armies={armies}
            avatars={avatars}
            tradeRoutes={tradeRoutes}
            conflicts={conflicts}
            selectedCellIndex={selectedCellIndex}
            selectedCellIndices={selectedCellIndices}
            onSelectCell={handleSelectCell}
            onClearSelection={handleClearSelection}
            viewMode={mapViewMode}
          />
        ) : (
          <FlatMapAtlas
            cells={cells}
            cities={cities}
            civilizations={civilizations}
            selectedCellIndex={selectedCellIndex}
            selectedCellIndices={selectedCellIndices}
            onSelectCell={handleSelectCell}
            onClearSelection={handleClearSelection}
            viewMode={mapViewMode}
          />
        )}

        {/* Collapsible Divine Powers Drawer */}
        <ControlDock
          currentAge={currentAge}
          playerPower={playerDeity.power}
          selectedCell={selectedCell}
          selectedCellIndices={selectedCellIndices}
          onClearSelection={handleClearSelection}
          onOpenRaceSynthesizer={() => setIsRaceModalOpen(true)}
          onOpenMiracleWeaver={() => setIsMiracleModalOpen(true)}
          onShapeTerrain={handleShapeTerrain}
          onShapeClimate={handleShapeClimate}
          onExecuteAction={handleExecuteGeneralAction}
        />
      </main>

      {/* Modals & Drawers */}
      <NewGameModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onStartNewGame={handleStartNewGame}
      />

      <SaveLoadModal
        isOpen={isSaveLoadModalOpen}
        onClose={() => setIsSaveLoadModalOpen(false)}
        currentGameState={{
          age: currentAge,
          round,
          year,
          playerDeityName: playerDeity.name,
          playerDeityTitle: playerDeity.title,
          deityCount: deities.length,
          worldStructure: currentWorldStructure,
          cells,
          cities,
          civilizations,
          races,
          armies,
          avatars,
          orders,
          tradeRoutes,
          conflicts,
          deities,
          turnOrder,
          activeDeityIndex,
          history,
          mapViewMode,
          is3DMode,
        }}
        onLoadGame={handleLoadGame}
      />

      <RaceGeneratorModal
        isOpen={isRaceModalOpen}
        onClose={() => setIsRaceModalOpen(false)}
        currentAge={currentAge}
        playerPower={playerDeity.power}
        existingRaces={races}
        targetCell={selectedCell}
        onCreateRace={handleCreateRace}
      />

      <MiracleWeaverModal
        isOpen={isMiracleModalOpen}
        onClose={() => setIsMiracleModalOpen(false)}
        targetCell={selectedCell}
        playerPower={playerDeity.power}
        onCastMiracle={handleCastMiracle}
      />

      <BattleModal
        isOpen={activeBattleResult !== null}
        battleResult={activeBattleResult}
        onClose={() => setActiveBattleResult(null)}
      />

      <ChronicleDrawer
        isOpen={isChronicleOpen}
        onClose={() => setIsChronicleOpen(false)}
        history={history}
      />

      <PantheonDrawer
        isOpen={isPantheonOpen}
        onClose={() => setIsPantheonOpen(false)}
        deities={deities}
        civilizations={civilizations}
        avatars={avatars}
        playerDeity={playerDeity}
        onOfferPact={handleOfferPact}
        onProvokeRival={handleProvokeRival}
        onBestowTribute={handleBestowTribute}
      />
    </div>
  );
}
