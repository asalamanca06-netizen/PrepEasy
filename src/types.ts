/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ingredient {
  id: string;
  name: string;
  category: 'Verduras' | 'Carnes' | 'Lácteos' | 'Granos' | 'Condimentos' | 'Otros';
  expirationDays: number; // days remaining
  quantity?: string;
  isNearingExpiry?: boolean; 
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number; // in minutes
  energyLevel: 'low' | 'balanced' | 'disconnect';
  utensils: string[];
  ingredientsNeeded: { name: string; required: boolean; inPantry: boolean }[];
  steps: string[];
  imageUrl: string;
  isSaved?: boolean;
}

export interface CookedHistory {
  id: string;
  recipeId: string;
  recipeTitle: string;
  date: string; // e.g. "Hoy a las 21:15", "Ayer"
  timeSaved: number; // prepTime
  rating: number; // 1-5
}

export type AppState = 'connected' | 'offline' | 'loading';
export type ActiveTab = 'inicio' | 'despensa' | 'planificador' | 'historial' | 'recetas';
export type EnergyLevel = 'low' | 'balanced' | 'disconnect';
